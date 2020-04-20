import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";

import useFormset, { FormsetData } from "@saleor/hooks/useFormset";
import { StockInput } from "@saleor/types/globalTypes";
import { WarehouseFragment } from "@saleor/warehouses/types/WarehouseFragment";
import TableCellAvatar from "@saleor/components/TableCellAvatar";
import Container from "@saleor/components/Container";
import PageHeader from "@saleor/components/PageHeader";
import SaveButtonBar from "@saleor/components/SaveButtonBar";
import { ConfirmButtonTransitionState } from "@saleor/components/ConfirmButton";
import Form from "@saleor/components/Form";
import { OrderFulfillData_order } from "@saleor/orders/types/OrderFulfillData";
import CardTitle from "@saleor/components/CardTitle";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { update } from "@saleor/utils/lists";
import ControlledCheckbox from "@saleor/components/ControlledCheckbox";

const useStyles = makeStyles(
  theme => ({
    actionBar: {
      flexDirection: "row",
      paddingLeft: theme.spacing(2) + 2
    },
    colName: {
      width: 300
    },
    colQuantity: {
      textAlign: "right",
      width: 210
    },
    colQuantityContent: {
      alignItems: "center",
      display: "inline-flex"
    },
    colQuantityTotal: {
      textAlign: "right",
      width: 180
    },
    colSku: {
      textAlign: "right",
      width: 120
    },
    error: {
      color: theme.palette.error.main
    },
    full: {
      fontWeight: 600
    },
    quantityInnerInput: {
      padding: "16px 0 14px 12px"
    },
    quantityInput: {
      width: 100
    },
    remainingQuantity: {
      marginLeft: theme.spacing()
    },
    table: {
      "&&": {
        tableLayout: "fixed"
      }
    }
  }),
  { name: "OrderFulfillPage" }
);

interface OrderFulfillFormData {
  sendInfo: boolean;
}
interface OrderFulfillSubmitData extends OrderFulfillFormData {
  items: FormsetData<null, StockInput[]>;
}
export interface OrderFulfillPageProps {
  disabled: boolean;
  order: OrderFulfillData_order;
  saveButtonBar: ConfirmButtonTransitionState;
  warehouses: WarehouseFragment[];
  onBack: () => undefined;
  onSubmit: (data: OrderFulfillSubmitData) => void;
}

const initialFormData: OrderFulfillFormData = {
  sendInfo: true
};

const OrderFulfillPage: React.FC<OrderFulfillPageProps> = ({
  disabled,
  order,
  saveButtonBar,
  warehouses,
  onBack,
  onSubmit
}) => {
  const intl = useIntl();
  const classes = useStyles({});

  const { change: formsetChange, data: formsetData } = useFormset<
    null,
    StockInput[]
  >(
    order?.lines.map(line => ({
      data: null,
      id: line.id,
      label: line.variant.attributes
        .map(attribute =>
          attribute.values
            .map(attributeValue => attributeValue.name)
            .join(" , ")
        )
        .join(" / "),
      value: line.variant.stocks.map(stock => ({
        quantity: 0,
        warehouse: stock.warehouse.id
      }))
    }))
  );

  const handleSubmit = (formData: OrderFulfillFormData) =>
    onSubmit({
      ...formData,
      items: formsetData
    });

  return (
    <Container>
      <PageHeader
        title={intl.formatMessage(
          {
            defaultMessage: "Order no. {orderNumber} - Add Fulfillment",
            description: "page header"
          },
          {
            orderNumber: order?.number
          }
        )}
      />
      <Form initial={initialFormData} onSubmit={handleSubmit}>
        {({ change, data, submit }) => (
          <>
            <Card>
              <CardTitle
                title={intl.formatMessage({
                  defaultMessage: "Items ready to ship",
                  description: "header"
                })}
              />
              <ResponsiveTable className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.colName}>
                      <FormattedMessage defaultMessage="Product name" />
                    </TableCell>
                    <TableCell className={classes.colSku}>
                      <FormattedMessage
                        defaultMessage="SKU"
                        description="product's sku"
                      />
                    </TableCell>
                    {warehouses.map(warehouse => (
                      <TableCell
                        key={warehouse.id}
                        className={classes.colQuantity}
                      >
                        {warehouse.name}
                      </TableCell>
                    ))}
                    <TableCell className={classes.colQuantityTotal}>
                      <FormattedMessage
                        defaultMessage="Quantity to fulfill"
                        description="quantity of fulfilled products"
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order?.lines.map((line, lineIndex) => {
                    const remainingQuantity =
                      line.quantity - line.quantityFulfilled;
                    const quantityToFulfill = formsetData[
                      lineIndex
                    ].value.reduce(
                      (quantityToFulfill, lineInput) =>
                        quantityToFulfill + lineInput.quantity,
                      0
                    );
                    const overfulfill = remainingQuantity < quantityToFulfill;

                    return (
                      <TableRow key={line.id}>
                        <TableCellAvatar
                          className={classes.colName}
                          thumbnail={line?.thumbnail?.url}
                        >
                          {line.productName}
                          <Typography color="textSecondary" variant="caption">
                            {line.variant.attributes
                              .map(attribute =>
                                attribute.values
                                  .map(attributeValue => attributeValue.name)
                                  .join(", ")
                              )
                              .join(" / ")}
                          </Typography>
                        </TableCellAvatar>
                        <TableCell className={classes.colSku}>
                          {line.variant.sku}
                        </TableCell>
                        {warehouses.map(warehouse => {
                          const warehouseStock = line.variant.stocks.find(
                            stock => stock.warehouse.id === warehouse.id
                          );
                          const formsetStock = formsetData[
                            lineIndex
                          ].value.find(line => line.warehouse === warehouse.id);

                          if (!warehouseStock) {
                            return (
                              <TableCell
                                className={classNames(
                                  classes.colQuantity,
                                  classes.error
                                )}
                              >
                                <FormattedMessage
                                  defaultMessage="No Stock"
                                  description="no variant stock in warehouse"
                                />
                              </TableCell>
                            );
                          }

                          return (
                            <TableCell className={classes.colQuantity}>
                              <div className={classes.colQuantityContent}>
                                <TextField
                                  type="number"
                                  inputProps={{
                                    className: classes.quantityInnerInput,
                                    max: warehouseStock.quantity,
                                    min: 0,
                                    style: { textAlign: "right" }
                                  }}
                                  className={classes.quantityInput}
                                  value={formsetStock.quantity}
                                  onChange={event =>
                                    formsetChange(
                                      line.id,
                                      update(
                                        {
                                          quantity: parseInt(
                                            event.target.value,
                                            10
                                          ),
                                          warehouse: warehouse.id
                                        },
                                        formsetData[lineIndex].value,
                                        (a, b) => a.warehouse === b.warehouse
                                      )
                                    )
                                  }
                                  error={
                                    overfulfill ||
                                    formsetStock.quantity >
                                      warehouseStock.quantity
                                  }
                                />
                                <div className={classes.remainingQuantity}>
                                  / {warehouseStock.quantity}
                                </div>
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className={classes.colQuantityTotal}>
                          <span
                            className={classNames({
                              [classes.error]: overfulfill,
                              [classes.full]:
                                remainingQuantity <= quantityToFulfill
                            })}
                          >
                            {quantityToFulfill}
                          </span>{" "}
                          / {remainingQuantity}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </ResponsiveTable>
              <CardActions className={classes.actionBar}>
                <ControlledCheckbox
                  checked={data.sendInfo}
                  label={intl.formatMessage({
                    defaultMessage: "Send shipment details to customer",
                    description: "checkbox"
                  })}
                  name="sendInfo"
                  onChange={change}
                />
              </CardActions>
            </Card>
            <SaveButtonBar
              disabled={disabled}
              labels={{
                save: intl.formatMessage({
                  defaultMessage: "Fulfill",
                  description: "fulfill order, button"
                })
              }}
              state={saveButtonBar}
              onSave={submit}
              onCancel={onBack}
            />
          </>
        )}
      </Form>
    </Container>
  );
};

OrderFulfillPage.displayName = "OrderFulfillPage";
export default OrderFulfillPage;