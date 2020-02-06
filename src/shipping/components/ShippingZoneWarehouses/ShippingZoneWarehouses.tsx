import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import React from "react";
import { useIntl } from "react-intl";

import CardTitle from "@saleor/components/CardTitle";
import { FetchMoreProps } from "@saleor/types";
import { FormChange } from "@saleor/hooks/useForm";
import MultiAutocompleteSelectField, {
  MultiAutocompleteChoiceType
} from "@saleor/components/MultiAutocompleteSelectField";

interface ShippingZoneWarehousesFormData {
  warehouses: string[];
}
interface ShippingZonewWarehousesProps extends FetchMoreProps {
  data: ShippingZoneWarehousesFormData;
  displayValue: MultiAutocompleteChoiceType[];
  warehouses: MultiAutocompleteChoiceType[];
  onChange: FormChange;
}

export const ShippingZoneWarehouses: React.FC<ShippingZonewWarehousesProps> = props => {
  const {
    data,
    displayValue,
    hasMore,
    loading,
    onChange,
    onFetchMore,
    warehouses
  } = props;
  const intl = useIntl();

  return (
    <Card>
      <CardTitle
        title={intl.formatMessage({
          defaultMessage: "Warehouse",
          description: "section header"
        })}
      />
      <CardContent>
        <MultiAutocompleteSelectField
          choices={warehouses}
          displayValues={displayValue}
          fetchChoices={() => undefined}
          hasMore={hasMore}
          label={intl.formatMessage({
            defaultMessage: "Warehouse"
          })}
          loading={loading}
          name="warehouse"
          onChange={onChange}
          onFetchMore={onFetchMore}
          placeholder={intl.formatMessage({
            defaultMessage: "Select Warehouse",
            description: "input placeholder"
          })}
          value={data.warehouses}
        />
      </CardContent>
    </Card>
  );
};
ShippingZoneWarehouses.displayName = "ShippingZoneWarehouses";
export default ShippingZoneWarehouses;