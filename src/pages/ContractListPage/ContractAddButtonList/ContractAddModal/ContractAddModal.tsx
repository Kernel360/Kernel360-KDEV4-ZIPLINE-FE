import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  MenuItem,
  TextField,
  Button as MuiButton,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import apiClient from "@apis/apiClient";
import Button from "@components/Button";
import dayjs from "dayjs";

// ✅ 자동 상태 계산 함수
const getContractStatus = (
  contractDate: Dayjs,
  contractStartDate: Dayjs,
  contractEndDate: Dayjs
): "PENDING" | "ACTIVE" | "EXPIRED" => {
  const today = dayjs();
  if (today.isBefore(contractStartDate)) return "PENDING";
  if (today.isAfter(contractEndDate)) return "EXPIRED";
  return "ACTIVE";
};

interface Props {
  open: boolean;
  handleClose: () => void;
  fetchContractData: () => void;
}

interface ContractData {
  customerUid: number;
  category: string;
  contractDate: string;
  contractStartDate: string;
  contractEndDate: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
}

const ContractAddModal = ({ open, handleClose, fetchContractData }: Props) => {
  const [category, setCategory] = useState("");
  const [contractDate, setContractDate] = useState<Dayjs | null>(null);
  const [contractStartDate, setContractStartDate] = useState<Dayjs | null>(null);
  const [contractEndDate, setContractEndDate] = useState<Dayjs | null>(null);
  const [customerUid, setCustomerUid] = useState<number | null>(null);
  const [customerOptions, setCustomerOptions] = useState<{ uid: number; name: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleClickSubmitButton = () => {
    if (!contractDate || !contractStartDate || !contractEndDate || !customerUid) return;

    const status = getContractStatus(contractDate, contractStartDate, contractEndDate);

    const contractData: ContractData = {
      customerUid,
      category,
      contractDate: contractDate.format("YYYY-MM-DD"),
      contractStartDate: contractStartDate.format("YYYY-MM-DD"),
      contractEndDate: contractEndDate.format("YYYY-MM-DD"),
      status,
    };

    const formData = new FormData();
    formData.append(
      "contractRequestDTO",
      new Blob([JSON.stringify(contractData)], { type: "application/json" })
    );
    files.forEach((file) => formData.append("files", file));

    apiClient
      .post("/contracts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 201) {
          alert("계약 등록 성공");
          fetchContractData();
          handleModalClose();
        }
      })
      .catch((error) => {
        console.error("계약 등록 실패:", error);
      });
  };

  const handleModalClose = () => {
    setCategory("");
    setContractDate(null);
    setContractStartDate(null);
    setContractEndDate(null);
    setCustomerUid(null);
    setFiles([]);
    handleClose();
  };

  useEffect(() => {
    apiClient.get("/customers").then((res) => {
      setCustomerOptions(res.data.data.customers);
    });
  }, []);

  const isSubmitButtonDisabled =
    !category || !contractDate || !contractStartDate || !contractEndDate || !customerUid;

  return (
    <Modal open={open} onClose={handleModalClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "40vw",
          backgroundColor: "white",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          계약 등록
        </Typography>

        <TextField
          select
          label="고객 선택"
          value={customerUid ?? ""}
          onChange={(e) => setCustomerUid(Number(e.target.value))}
          fullWidth
          sx={{ mb: 2 }}
        >
          {customerOptions.map((customer) => (
            <MenuItem key={customer.uid} value={customer.uid}>
              {customer.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="계약 카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ width: "100%", mb: 2 }}>
            <DesktopDatePicker
              label="계약일"
              value={contractDate}
              onChange={setContractDate}
              format="YYYY. MM. DD"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <DesktopDatePicker
              label="계약 시작일"
              value={contractStartDate}
              onChange={setContractStartDate}
              format="YYYY. MM. DD"
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DesktopDatePicker
              label="계약 종료일"
              value={contractEndDate}
              onChange={setContractEndDate}
              format="YYYY. MM. DD"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </LocalizationProvider>

        <MuiButton variant="outlined" component="label" sx={{ my: 2 }} fullWidth>
          파일 업로드
          <input type="file" hidden multiple onChange={handleFileChange} />
        </MuiButton>

        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">업로드된 파일:</Typography>
            <ul>
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </Box>
        )}

        <Button
          text="등록"
          disabled={isSubmitButtonDisabled}
          onClick={handleClickSubmitButton}
          sx={{
            mt: 2,
            color: "white !important",
            backgroundColor: "#2E5D9F",
            "&:disabled": {
              backgroundColor: "lightgray",
              color: "white",
            },
          }}
        />
      </Box>
    </Modal>
  );
};

export default ContractAddModal;
