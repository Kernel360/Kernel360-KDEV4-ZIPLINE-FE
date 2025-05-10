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
  Chip,
} from "@mui/material";
import { ContractItem } from "../ContractListPage";

const CONTRACT_STATUS_TYPES = [
  { value: "LISTED", name: "매물 등록", color: "default" },
  { value: "NEGOTIATING", name: "협상 중", color: "info" },
  { value: "INTENT_SIGNED", name: "가계약", color: "warning" },
  { value: "CANCELLED", name: "계약 취소", color: "error" },
  { value: "CONTRACTED", name: "계약 체결", color: "success" },
  { value: "IN_PROGRESS", name: "계약 진행 중", color: "primary" },
  { value: "PAID_COMPLETE", name: "잔금 지급 완료", color: "secondary" },
  { value: "REGISTERED", name: "등기 완료", color: "success" },
  { value: "MOVED_IN", name: "입주 완료", color: "success" },
  { value: "TERMINATED", name: "계약 해지", color: "error" },
];

const categoryKoreanMap: Record<string, string> = {
  SALE: "매매",
  DEPOSIT: "전세",
  MONTHLY: "월세",
};

interface Props {
  contractList: ContractItem[];
  onRowClick?: (contract: ContractItem) => void;
  totalElements: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContractTable = ({
  contractList,
  onRowClick,
  totalElements,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) => {
  const getColor = (color: string) => {
    switch (color) {
      case "primary":
        return "#1976d2";
      case "success":
        return "#2e7d32";
      case "error":
        return "#d32f2f";
      case "warning":
        return "#ed6c02";
      case "info":
        return "#0288d1";
      case "secondary":
        return "#9c27b0";
      default:
        return "#999";
    }
  };

  const getStatusChip = (status: string) => {
    const statusInfo = CONTRACT_STATUS_TYPES.find(
      (item) => item.value === status
    );
    if (!statusInfo) return status;

    return (
      <Chip
        label={statusInfo.name}
        variant="outlined"
        sx={{
          color: getColor(statusInfo.color),
          borderColor: getColor(statusInfo.color),
          fontWeight: 500,
          height: 28,
          fontSize: 13,
        }}
      />
    );
  };

  const getCategoryChip = (category: string | null) => {
    if (!category || category === "null") return "-";
    const label = categoryKoreanMap[category] ?? category;
    const colorMap: Record<string, string> = {
      SALE: "#4caf50",
      DEPOSIT: "#2196f3",
      MONTHLY: "#ff9800",
    };
    return (
      <Chip
        label={label}
        variant="outlined"
        sx={{
          color: colorMap[category],
          borderColor: colorMap[category],
          fontWeight: 500,
          height: 26,
          fontSize: 13,
        }}
      />
    );
  };

  const getCustomerDisplay = (customer: string | string[] | null | undefined) => {
    if (!customer || customer === "null") return "-";
    if (Array.isArray(customer)) {
      if (customer.length === 0) return "-";
      if (customer.length === 1) return customer[0];
      return `${customer[0]} 외 ${customer.length - 1}명`;
    }
    return customer;
  };

  return (
    <Box sx={{ width: "100%", mt: 4 }}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">임대/매도인</TableCell>
                <TableCell align="center">임차/매수인</TableCell>
                <TableCell align="center">주소</TableCell>
                <TableCell align="center">계약 카테고리</TableCell>
                <TableCell align="center">계약일</TableCell>
                <TableCell align="center">계약 시작일</TableCell>
                <TableCell align="center">계약 종료일</TableCell>
                <TableCell align="center">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contractList.length > 0 ? (
                contractList.map((contract) => (
                  <TableRow
                    key={contract.uid}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => onRowClick?.(contract)}
                  >
                    <TableCell align="center">
                      {getCustomerDisplay(contract.lessorOrSellerNames)}
                    </TableCell>
                    <TableCell align="center">
                      {getCustomerDisplay(contract.lesseeOrBuyerNames)}
                    </TableCell>
                    <TableCell align="center">{contract.address}</TableCell>
                    <TableCell align="center">
                      {getCategoryChip(contract.category)}
                    </TableCell>
                    <TableCell align="center">
                      {contract.contractDate ?? "-"}
                    </TableCell>
                    <TableCell align="center">
                      {contract.contractStartDate ?? "-"}
                    </TableCell>
                    <TableCell align="center">
                      {contract.contractEndDate ?? "-"}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(contract.status)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    계약 데이터가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10]}
          labelRowsPerPage="페이지당 행"
        />
      </Paper>
    </Box>
  );
};

export default ContractTable;
