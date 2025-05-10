import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";

const CONTRACT_STATUS_TYPES = [
  { value: "LISTED", name: "매물 등록", color: "#9e9e9e" },
  { value: "NEGOTIATING", name: "협상 중", color: "#0288d1" },
  { value: "INTENT_SIGNED", name: "가계약", color: "#f57c00" },
  { value: "CANCELLED", name: "계약 취소", color: "#d32f2f" },
  { value: "CONTRACTED", name: "계약 체결", color: "#388e3c" },
  { value: "IN_PROGRESS", name: "계약 진행 중", color: "#1976d2" },
  { value: "PAID_COMPLETE", name: "잔금 지급 완료", color: "#7b1fa2" },
  { value: "REGISTERED", name: "등기 완료", color: "#388e3c" },
  { value: "MOVED_IN", name: "입주 완료", color: "#388e3c" },
  { value: "TERMINATED", name: "계약 해지", color: "#d32f2f" },
];
const statusKoreanMap: Record<string, string> = {
  LISTED: "매물 등록됨",
  NEGOTIATING: "협상 중",
  INTENT_SIGNED: "가계약",
  CANCELLED: "계약 취소",
  CONTRACTED: "계약 체결",
  IN_PROGRESS: "계약 진행 중",
  PAID_COMPLETE: "잔금 지급 완료",
  REGISTERED: "등기 완료",
  MOVED_IN: "입주 완료",
  TERMINATED: "계약 해지",
};

const categoryKoreanMap: Record<string, string> = {
  SALE: "매매",
  DEPOSIT: "전세",
  MONTHLY: "월세",
};

interface ContractDocument {
  fileName: string;
  fileUrl: string;
}

interface ContractDetail {
  uid: number;
  category: string;
  deposit: number;
  monthlyRent: number;
  price: number;
  contractStartDate: string | null;
  contractEndDate: string | null;
  expectedContractEndDate: string | null;
  contractDate: string | null;
  status: string;
  lessorOrSellerNames: string[];
  lesseeOrBuyerNames: string[];
  documents: ContractDocument[];
  propertyAddress: string;
}

interface ContractHistory {
  prevStatus: string;
  currentStatus: string;
  changedAt: string;
}

interface Props {
  contract: ContractDetail;
  histories: ContractHistory[];
}

const getCustomerNamesDisplay = (names: string[] | undefined | null) => {
  if (!names || names.length === 0) return "-";
  return names.join(", ");
};

const ContractDetailContent = ({ contract, histories }: Props) => {
  return (
    <>
      {/* 계약 기본정보, 당사자 정보 */}
      <Box display="flex" gap={3} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              계약 기본 정보
            </Typography>
            <InfoRow
              label="카테고리"
              value={(() => {
                if (!contract.category || contract.category === "null")
                  return "-";
                const categoryLabel =
                  categoryKoreanMap[contract.category] ?? contract.category;
                const categoryColor =
                  contract.category === "SALE"
                    ? "#388e3c"
                    : contract.category === "DEPOSIT"
                    ? "#1976d2"
                    : contract.category === "MONTHLY"
                    ? "#f57c00"
                    : "#999";

                return (
                  <Chip
                    label={categoryLabel}
                    variant="outlined"
                    sx={{
                      height: 26,
                      color: categoryColor,
                      borderColor: categoryColor,
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  />
                );
              })()}
            />
            <InfoRow
              label="상태"
              value={(() => {
                const statusInfo = CONTRACT_STATUS_TYPES.find(
                  (item) => item.value === contract.status
                );
                return (
                  <Chip
                    label={statusInfo?.name ?? contract.status}
                    variant="outlined"
                    sx={{
                      color: statusInfo?.color,
                      borderColor: statusInfo?.color,
                      fontWeight: 500,
                      fontSize: 13,
                      height: 28,
                    }}
                  />
                );
              })()}
            />
            <InfoRow label="계약 시작일" value={contract.contractStartDate ?? "-"} />
            <InfoRow label="계약 종료일" value={contract.contractEndDate ?? "-"} />
            {contract.status === "CANCELLED" && (
              <InfoRow
                label="계약 예상 종료일"
                value={contract.expectedContractEndDate ?? "-"}
              />
            )}
            <InfoRow label="매물 주소" value={contract.propertyAddress} />
            <InfoRow
              label="보증금"
              value={
                contract.deposit && contract.deposit > 0
                  ? `${contract.deposit.toLocaleString()}원`
                  : "- 원"
              }
            />
            <InfoRow
              label="월세"
              value={
                contract.monthlyRent && contract.monthlyRent > 0
                  ? `${contract.monthlyRent.toLocaleString()}원`
                  : "- 원"
              }
            />
            <InfoRow
              label="매매가"
              value={
                contract.price && contract.price > 0
                  ? `${contract.price.toLocaleString()}원`
                  : "- 원"
              }
            />
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              계약 당사자 정보
            </Typography>
            <InfoRow label="임대/매도인" value={getCustomerNamesDisplay(contract.lessorOrSellerNames)} />
            <InfoRow
              label="임차/매수인"
              value={getCustomerNamesDisplay(contract.lesseeOrBuyerNames)}
            />
            <InfoRow label="계약일" value={contract.contractDate ?? "-"} />
          </CardContent>
        </Card>
      </Box>

      {/* 첨부문서, 히스토리 */}
      <Box display="flex" gap={3}>
        <Card sx={{ flex: 1, minHeight: 200 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              첨부 문서
            </Typography>
            {contract.documents.length > 0 ? (
              contract.documents.map((doc, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    mb: 1,
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      flex: 0.6,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={doc.fileName}
                  >
                    📎 {doc.fileName}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={doc.fileUrl}
                    download={doc.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    다운로드
                  </Button>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">첨부 문서 없음</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1.4, minHeight: 200 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              상태 변경 이력
            </Typography>
            {histories.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>변경 전 상태</TableCell>
                    <TableCell>변경 후 상태</TableCell>
                    <TableCell>변경일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {histories.map((h, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {statusKoreanMap[h.prevStatus] ?? h.prevStatus}
                      </TableCell>
                      <TableCell>
                        {statusKoreanMap[h.currentStatus] ?? h.currentStatus}
                      </TableCell>
                      <TableCell>{h.changedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary" align="center">
                히스토리 없음
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={1.5}
    sx={{ minHeight: 28 }}
  >
    <Typography color="text.secondary" sx={{ minWidth: 100 }}>
      {label}
    </Typography>
    <Box>{value}</Box>
  </Box>
);

export default ContractDetailContent;
