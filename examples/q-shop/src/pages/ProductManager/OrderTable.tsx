import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import moment from "moment";
import { Order } from "../../state/features/orderSlice";
import { CircularProgress } from "@mui/material";

const tableCellFontSize = "16px";

interface ColumnData {
  dataKey: keyof Order;
  label: string;
  numeric?: boolean;
  width?: number;
  status?: string;
}

const columns: ColumnData[] = [
  {
    label: "Customer",
    dataKey: "user"
  },
  {
    label: "Status",
    dataKey: "status",
    width: 120
  },
  {
    label: "Total",
    dataKey: "totalPrice",
    width: 120
  },
  {
    label: "Created",
    dataKey: "created",
    numeric: true,
    width: 300
  }
];

interface SimpleTableProps {
  openOrder: (product: Order) => void;
  data: Order[];
  children?: React.ReactNode;
}

export const OrderTable = ({ openOrder, data, children }: SimpleTableProps) => {
  const hashMapOrders = useSelector(
    (state: RootState) => state.order.hashMapOrders
  );

  const { isLoadingGlobal } = useSelector((state: RootState) => state.global);

  const processedOrders = data.map((row, index) => {
    let rowData = row;
    if (hashMapOrders[row.id]) {
      rowData = {
        ...row,
        ...hashMapOrders[row.id]
      };
    }
    return { index, rowData };
  });

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column) => {
          return (
            <TableCell
              key={column.dataKey}
              variant="head"
              align={column.numeric || false ? "right" : "left"}
              style={{ width: column.width }}
              sx={{
                backgroundColor: "background.paper",
                fontSize: tableCellFontSize,
                padding: "7px"
              }}
            >
              {column.label}
            </TableCell>
          );
        })}
      </TableRow>
    );
  }

  function rowContent(_index: number, rowData: Order, openOrder: any) {
    return (
      <React.Fragment>
        {columns.map((column) => {
          return (
            <TableCell
              onClick={() => openOrder(rowData)}
              key={column.dataKey}
              align={column.numeric || false ? "right" : "left"}
              style={{ width: column.width, cursor: "pointer" }}
              sx={{
                fontSize: tableCellFontSize,
                padding: "7px"
              }}
            >
              <>
                {column.dataKey === "created"
                  ? moment(rowData[column.dataKey]).format("llll")
                  : column.dataKey === "totalPrice"
                  ? rowData[column.dataKey]
                  : rowData[column.dataKey]}
              </>
            </TableCell>
          );
        })}
      </React.Fragment>
    );
  }

  if (isLoadingGlobal) return <CircularProgress />;

  return (
    <Paper style={{ width: "100%" }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>{fixedHeaderContent()}</TableHead>
          <TableBody>
            {processedOrders.map(({ index, rowData }) => (
              <TableRow key={index}>
                {rowContent(index, rowData, openOrder)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {children}
    </Paper>
  );
};

// export const AvatarWrapper = ({ user }: any) => {
//   const userAvatarHash = useSelector(
//     (state: RootState) => state.global.userAvatarHash
//   );
//   const avatarLink = React.useMemo(() => {
//     if (!user || !userAvatarHash) return "";
//     const findUserAvatar = userAvatarHash[user];
//     if (!findUserAvatar) return "";
//     return findUserAvatar;
//   }, [userAvatarHash, user]);

//   return <Avatar src={avatarLink} alt={`${user}'s avatar`} />;
// };
