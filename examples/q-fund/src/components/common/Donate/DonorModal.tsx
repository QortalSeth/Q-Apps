import {
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ModalBody } from "../../Crowdfund/Crowdfund-styles";
import Box from "@mui/material/Box";
import { ViewableDonorData } from "./DonorInfo";

interface DonorModalProps {
  donorData: ViewableDonorData[];
  closeModal: () => void;
  open: boolean;
}

const DonorModal = ({ donorData, closeModal, open }: DonorModalProps) => {
  return (
    <Modal
      open={open}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClose={closeModal}
    >
      <ModalBody>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TableContainer sx={{ maxHeight: "300px" }}>
            <Table align="center" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donorData.map((donorData, index) => (
                  <TableRow key={donorData.address + index.toString()}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{donorData.nameIfExists}</TableCell>
                    <TableCell>{donorData.amount}</TableCell>
                    <TableCell>{donorData.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <h3>Total # of donations: {donorData.length}</h3>

        <Button onClick={closeModal}>Close</Button>
      </ModalBody>
    </Modal>
  );
};
export default DonorModal;
