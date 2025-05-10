import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  MenuItem,
  TextField,
  Button as MuiButton,
  Select,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import apiClient from "@apis/apiClient";
import Button from "@components/Button";
import { toast } from "react-toastify";

const CONTRACT_STATUS_OPTIONS = [
  { value: "LISTED", label: "매물 등록" },
  { value: "NEGOTIATING", label: "협상 중" },
  { value: "INTENT_SIGNED", label: "가계약" },
  { value: "CANCELLED", label: "계약 취소" },
  { value: "CONTRACTED", label: "계약 체결" },
  { value: "IN_PROGRESS", label: "계약 진행 중" },
  { value: "PAID_COMPLETE", label: "잔금 지급 완료" },
  { value: "REGISTERED", label: "등기 완료" },
  { value: "MOVED_IN", label: "입주 완료" },
  { value: "TERMINATED", label: "계약 해지" },
] as const;

type ContractStatus = (typeof CONTRACT_STATUS_OPTIONS)[number]["value"];

interface Props {
  open: boolean;
  handleClose: () => void;
  fetchContractData: () => void;
}

const ContractAddModal = ({ open, handleClose, fetchContractData }: Props) => {
  const [category, setCategory] = useState<string | null>(null);
  const [contractDate, setContractDate] = useState<Dayjs | null>(null);
  const [contractStartDate, setContractStartDate] = useState<Dayjs | null>(
    null
  );
  const [contractEndDate, setContractEndDate] = useState<Dayjs | null>(null);
  const [expectedContractEndDate, setExpectedContractEndDate] =
    useState<Dayjs | null>(null);

  const [deposit, setDeposit] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [price, setPrice] = useState("");

  const [lessorUids, setLessorUids] = useState<number[]>([]);
  const [lesseeUids, setLesseeUids] = useState<number[]>([]);
  const [propertyUid, setPropertyUid] = useState<number | null>(null);
  const [status, setStatus] = useState<ContractStatus>("IN_PROGRESS");

  const [customerOptions, setCustomerOptions] = useState<
    { uid: number; name: string }[]
  >([]);
  const [propertyOptions, setPropertyOptions] = useState<
    { uid: number; address: string }[]
  >([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    apiClient.get("/customers").then((res) => {
      setCustomerOptions(res.data.data.customers);
    });
    apiClient
      .get("/properties")
      .then((res) => {
        setPropertyOptions(res.data.data.agentProperty);
      })
      .catch((err) => {
        console.error("매물 목록 불러오기 실패", err);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  const [errors, setErrors] = useState<{
    category?: string;
    contractDate?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    expectedContractEndDate?: string;
    deposit?: string;
    monthlyRent?: string;
    price?: string;
    lessorUids?: string;
    lesseeUids?: string;
    propertyUid?: string;
    status?: string;
  }>({});

  const isValidInteger = (value: string) => {
    if (value === "") return true;
    return /^\d+$/.test(value);
  };
  const validateInputs = () => {
    const newErrors: typeof errors = {};
    if (
      contractDate &&
      contractStartDate &&
      contractDate.isAfter(contractStartDate)
    ) {
      newErrors.contractDate = "계약일은 시작일보다 이전이어야 합니다.";
    }

    if (
      contractStartDate &&
      contractEndDate &&
      !contractStartDate.isBefore(contractEndDate)
    ) {
      newErrors.contractStartDate = "시작일은 종료일보다 이전이어야 합니다.";
    }

    if (lessorUids.length === 0)
      newErrors.lessorUids = "임대/매도자를 선택해 주세요.";

    // 임대자와 임차자가 겹치는지 확인
    const hasOverlap = lessorUids.some((id) => lesseeUids.includes(id));
    if (hasOverlap) {
      newErrors.lesseeUids = "임대자와 임차자는 같을 수 없습니다.";
    }

    if (!propertyUid) newErrors.propertyUid = "매물을 선택해 주세요.";
    if (!status) newErrors.status = "계약 상태를 선택해 주세요.";
    if (deposit && !isValidInteger(deposit)) {
      newErrors.deposit = "유효한 값을 입력해 주세요.";
    } else if (deposit && Number(deposit) < 0) {
      newErrors.deposit = "보증금은 0 이상의 숫자여야 합니다.";
    }
    if (monthlyRent && !isValidInteger(monthlyRent)) {
      newErrors.monthlyRent = "유효한 값을 입력해 주세요.";
    } else if (monthlyRent && Number(monthlyRent) < 0) {
      newErrors.monthlyRent = "월세는 0 이상의 숫자여야 합니다.";
    }

    if (price && !isValidInteger(price)) {
      newErrors.price = "유효한 값을 입력해 주세요.";
    } else if (price && Number(price) < 0) {
      newErrors.price = "매매가는 0 이상의 숫자여야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateInputs()) return;

    const requestPayload = {
      category: category === "" ? null : category,
      contractDate: contractDate ? contractDate.format("YYYY-MM-DD") : null,
      contractStartDate: contractStartDate
        ? contractStartDate.format("YYYY-MM-DD")
        : null,
      contractEndDate: contractEndDate
        ? contractEndDate.format("YYYY-MM-DD")
        : null,
      expectedContractEndDate: expectedContractEndDate
        ? expectedContractEndDate.format("YYYY-MM-DD")
        : null,
      deposit: deposit ? parseInt(deposit, 10) : 0,
      monthlyRent: monthlyRent ? parseInt(monthlyRent, 10) : 0,
      price: price ? parseInt(price, 10) : 0,
      lessorOrSellerUids: lessorUids,
      lesseeOrBuyerUids: lesseeUids,
      propertyUid,
      status,
    };

    const formData = new FormData();
    formData.append(
      "contractRequestDTO",
      new Blob([JSON.stringify(requestPayload)], { type: "application/json" })
    );
    files.forEach((file) => formData.append("files", file));

    apiClient
      .post("/contracts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("계약 등록 성공!");
        fetchContractData();
        handleModalClose();
      })
      .catch((err) => {
        console.error("계약 등록 실패", err);
        toast.error("계약 등록에 실패했습니다.");
      });
  };

  const handleModalClose = () => {
    setCategory("");
    setContractDate(null);
    setContractStartDate(null);
    setContractEndDate(null);
    setExpectedContractEndDate(null);
    setDeposit("");
    setMonthlyRent("");
    setPrice("");
    setLessorUids([]);
    setLesseeUids([]);
    setPropertyUid(null);
    setStatus("IN_PROGRESS");
    setFiles([]);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleModalClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "40vw",
          bgcolor: "white",
          p: 4,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          계약 등록
        </Typography>

        <TextField
          select
          label="계약 카테고리"
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value)}
          error={!!errors.category}
          helperText={errors.category}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="SALE">매매</MenuItem>
          <MenuItem value="DEPOSIT">전세</MenuItem>
          <MenuItem value="MONTHLY">월세</MenuItem>
        </TextField>

        <TextField
          select
          label="계약 상태 *"
          value={status}
          onChange={(e) => setStatus(e.target.value as ContractStatus)}
          error={!!errors.status}
          helperText={errors.status}
          fullWidth
          sx={{ mb: 2 }}
        >
          {CONTRACT_STATUS_OPTIONS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="임대/매도자 선택 *"
          value={lessorUids}
          onChange={(e) =>
            setLessorUids(
              typeof e.target.value === "string"
                ? e.target.value.split(",").map(Number)
                : e.target.value
            )
          }
          SelectProps={{
            multiple: true,
            displayEmpty: true,
            renderValue: (selected) =>
              selected.length === 0
                ? undefined
                : (selected as number[])
                    .map((uid) => {
                      const customer = customerOptions.find(
                        (c) => c.uid === uid
                      );
                      return customer?.name || uid;
                    })
                    .join(", "),
          }}
          error={!!errors.lessorUids}
          helperText={errors.lessorUids}
          fullWidth
          sx={{ mb: 2 }}
        >
          {customerOptions.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="임차/매수자 선택"
          value={lesseeUids ?? []}
          onChange={(e) =>
            setLesseeUids(
              typeof e.target.value === "string"
                ? e.target.value.split(",").map(Number)
                : e.target.value
            )
          }
          SelectProps={{
            multiple: true,
            displayEmpty: true,
            renderValue: (selected) =>
              selected.length === 0
                ? undefined
                : (selected as number[])
                    .map((uid) => {
                      const customer = customerOptions.find(
                        (c) => c.uid === uid
                      );
                      return customer?.name || uid;
                    })
                    .join(", "),
          }}
          error={!!errors.lesseeUids}
          helperText={errors.lesseeUids}
          fullWidth
          sx={{ mb: 2 }}
        >
          {customerOptions.map((c) => (
            <MenuItem key={c.uid} value={c.uid}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="매물 선택 *"
          value={propertyUid ?? ""}
          onChange={(e) => setPropertyUid(Number(e.target.value))}
          error={!!errors.propertyUid}
          helperText={errors.propertyUid}
          fullWidth
          sx={{ mb: 2 }}
        >
          {propertyOptions.length > 0 ? (
            propertyOptions.map((p) => (
              <MenuItem key={p.uid} value={p.uid}>
                {p.address}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled value="">
              등록된 매물이 없습니다
            </MenuItem>
          )}
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopDatePicker
            label="계약일"
            value={contractDate}
            onChange={setContractDate}
            format="YYYY. MM. DD"
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.contractDate,
                helperText: errors.contractDate,
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 2, my: 2 }}>
            <DesktopDatePicker
              label="시작일"
              value={contractStartDate}
              onChange={setContractStartDate}
              format="YYYY. MM. DD"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.contractStartDate,
                  helperText: errors.contractStartDate,
                },
              }}
            />
            <DesktopDatePicker
              label="종료일"
              value={contractEndDate}
              onChange={setContractEndDate}
              format="YYYY. MM. DD"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.contractEndDate,
                  helperText: errors.contractEndDate,
                },
              }}
            />
          </Box>
          <DesktopDatePicker
            label="예상 종료일"
            value={expectedContractEndDate}
            onChange={setExpectedContractEndDate}
            format="YYYY. MM. DD"
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>

        <TextField
          label="보증금 (숫자)"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          error={!!errors.deposit}
          helperText={errors.deposit}
          type="number"
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          label="월세 (숫자)"
          value={monthlyRent}
          onChange={(e) => setMonthlyRent(e.target.value)}
          error={!!errors.monthlyRent}
          helperText={errors.monthlyRent}
          type="number"
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          label="매매가 (숫자)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={!!errors.price}
          helperText={errors.price}
          type="number"
          fullWidth
          sx={{ mt: 2 }}
        />

        <MuiButton
          variant="outlined"
          component="label"
          sx={{ my: 2 }}
          fullWidth
        >
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
          disabled={false}
          onClick={handleSubmit}
          sx={{
            mt: 2,
            color: "white !important",
            backgroundColor: "#164F9E",
            "&:disabled": { backgroundColor: "lightgray", color: "white" },
          }}
        />
      </Box>
    </Modal>
  );
};

export default ContractAddModal;
