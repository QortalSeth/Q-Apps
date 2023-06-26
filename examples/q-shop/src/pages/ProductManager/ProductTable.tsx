import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Avatar, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { formatTimestamp } from "../../utils/time";
import { Product } from "../../state/features/storeSlice";
import moment from "moment";

const tableCellFontSize = "16px";

interface Data {
  title: string;
  description: string;
  created: number;
  user: string;
  id: string;
  tags: string[];
  status: string;
}

interface ColumnData {
  dataKey: keyof Data;
  label: string;
  numeric?: boolean;
  width?: number;
}

const columns: ColumnData[] = [
  // {
  //   label: 'Sender',
  //   dataKey: 'user',
  //   width: 200
  // },
  {
    label: "Title",
    dataKey: "title"
  },
  {
    label: "Status",
    dataKey: "status",
    width: 120
  },
  {
    label: "Created",
    dataKey: "created",
    numeric: true,
    width: 300
  }
];

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => {
        const { label } = column;
        return (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={column.numeric || false ? "right" : "left"}
            style={{ width: column.width }}
            sx={{
              backgroundColor: "background.paper",
              fontSize: tableCellFontSize,
              padding:
                label === "Title" || label === "Created" ? "7px 35px" : "7px"
            }}
          >
            {column.label}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

function rowContent(_index: number, row: Product, openProduct: any) {
  const catalogueHashMap = useSelector(
    (state: RootState) => state.global.catalogueHashMap
  );

  return (
    <React.Fragment>
      {columns.map((column) => {
        let rowData = row;
        if (
          catalogueHashMap[row?.catalogueId] &&
          catalogueHashMap[row.catalogueId].products[row?.id]
        ) {
          rowData = {
            ...row,
            ...catalogueHashMap[row.catalogueId].products[row?.id],
            catalogueId: row?.catalogueId || ""
          };
        }
        return (
          <TableCell
            onClick={() => openProduct(rowData)}
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
                : column.dataKey === "status"
                ? rowData[column.dataKey] || "unknown"
                : rowData[column.dataKey]}
            </>
          </TableCell>
        );
      })}
    </React.Fragment>
  );
}

interface SimpleTableProps {
  openProduct: (product: Product) => void;
  data: Product[];
  children?: React.ReactNode;
}

export default function SimpleTable({
  openProduct,
  data,
  children
}: SimpleTableProps) {
  return (
    <Paper style={{ width: "100%" }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>{fixedHeaderContent()}</TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {rowContent(index, row, openProduct)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {children}
    </Paper>
  );
}

export const AvatarWrapper = ({ user }: any) => {
  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  );
  const avatarLink = React.useMemo(() => {
    if (!user || !userAvatarHash) return "";
    const findUserAvatar = userAvatarHash[user];
    if (!findUserAvatar) return "";
    return findUserAvatar;
  }, [userAvatarHash, user]);

  return <Avatar src={avatarLink} alt={`${user}'s avatar`} />;
};
