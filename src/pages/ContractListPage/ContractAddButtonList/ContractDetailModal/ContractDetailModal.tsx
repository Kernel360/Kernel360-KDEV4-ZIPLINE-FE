import {
    Modal,
    Box,
    Typography,
    Link,
    CircularProgress,
  } from "@mui/material";
  import Button from "@components/Button";
  import { useEffect, useState } from "react";
  import apiClient from "@apis/apiClient";
import { ContractItem } from "@pages/ContractListPage/ContractListPage";



  
  interface Props {
    open: boolean;
    onClose: () => void;
    contract: ContractItem | null;
  }
  
  interface ContractDetailResponse {
    uid: number;
    category: string;
    contractDate: string;
    contractStartDate: string;
    contractEndDate: string;
    status: "PENDING" | "ACTIVE" | "EXPIRED";
    customerName: string;
    documentUrls: string[];
  }
  
  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };
  
  const ContractDetailModal = ({ open, onClose, contract }: Props) => {
    const [detail, setDetail] = useState<ContractDetailResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
      if (open && contract?.uid) {
        setLoading(true);
        apiClient
          .get(`/contracts/${contract?.uid}`)
          .then((res) => {
            setDetail(res.data.data);
          })
          .catch((err) => {
            console.error("상세 조회 실패:", err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }, [open, contract?.uid]);
  
    if (!open) return null;
  
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                계약 상세 정보
              </Typography>
              <Typography><strong>고객 이름:</strong> {detail?.customerName}</Typography>
              <Typography><strong>계약 카테고리:</strong> {detail?.category}</Typography>
              <Typography><strong>계약일:</strong> {detail?.contractDate}</Typography>
              <Typography><strong>계약 시작일:</strong> {detail?.contractStartDate}</Typography>
              <Typography><strong>계약 종료일:</strong> {detail?.contractEndDate}</Typography>
              <Typography><strong>계약 상태:</strong> {detail?.status === "PENDING" ? "계약 전" : detail?.status === "ACTIVE" ? "진행 중" : "만료"}</Typography>
  
              {!loading && detail && detail.documentUrls.length > 0 && (
                <Box mt={2}>
                  <Typography sx={{ mb: 1 }}><strong>첨부 문서:</strong></Typography>
                  <ul>
                    {detail.documentUrls.map((url, idx) => (
                      <li key={idx}>
                        <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover" download>
                          문서 {idx + 1}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
  
              <Box mt={3}>
                <Button text="닫기" onClick={onClose} />
              </Box>
            </>
          )}
        </Box>
      </Modal>
    );
  };
  
  export default ContractDetailModal;
  