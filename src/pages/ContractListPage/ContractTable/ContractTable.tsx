import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import { ContractItem } from "../ContractListPage";
import Chip from "@components/Chip";

const CONTRACT_STATUS_TYPES: {
  value: string;
  name: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success";
}[] = [
  { value: "PENDING", name: "계약 전", color: "info" },
  { value: "ACTIVE", name: "진행 중", color: "success" },
  { value: "EXPIRED", name: "만료", color: "default" },
];

interface Props {
  contractList: ContractItem[];
  onRowClick?: (contract: ContractItem) => void;
}

const ContractTable = ({ contractList, onRowClick }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedContracts = contractList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusChip = (status: string) => {
    const statusInfo = CONTRACT_STATUS_TYPES.find(
      (item) => item.value === status
    );
    if (!statusInfo) return status;
    return <Chip color={statusInfo.color} text={statusInfo.name} />;
  };

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">고객 이름</TableCell>
                <TableCell align="center">계약 카테고리</TableCell>
                <TableCell align="center">계약일</TableCell>
                <TableCell align="center">계약 시작일</TableCell>
                <TableCell align="center">계약 종료일</TableCell>
                <TableCell align="center">계약 상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedContracts.length > 0 ? (
                displayedContracts.map((contract, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => onRowClick?.(contract)}
                  >
                    <TableCell align="center">{contract.customerName}</TableCell>
                    <TableCell align="center">{contract.category}</TableCell>
                    <TableCell align="center">{contract.contractDate}</TableCell>
                    <TableCell align="center">{contract.contractStartDate}</TableCell>
                    <TableCell align="center">{contract.contractEndDate}</TableCell>
                    <TableCell align="center">
                      {getStatusChip(contract.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    계약 데이터가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={contractList.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10]}
          labelRowsPerPage="페이지당 행"
        />
      </Paper>
    </Box>
  );
};

export default ContractTable;
