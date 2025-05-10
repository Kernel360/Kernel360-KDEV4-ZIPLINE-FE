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
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { InsertDriveFile } from "@mui/icons-material";
import {
  ContractDetail,
  ContractDocument,
} from "@pages/ContractDetailPage/ContractDetailPage";

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
  contractUid: number;
  initialData: ContractDetail;
}

interface AgentPropertyResponse {
  uid: number;
  address: string;
}

interface CustomerResponse {
  uid: number;
  name: string;
}

const ContractEditModal = ({
  open,
  handleClose,
  fetchContractData,
  contractUid,
}: Props) => {
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
  const [status, setStatus] = useState<ContractStatus | "">("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<
    { documentName: string; documentUrl: string; deleted?: boolean }[]
  >([]);

  const [customerOptions, setCustomerOptions] = useState<
    { uid: number; name: string }[]
  >([]);
  const [propertyOptions, setPropertyOptions] = useState<
    { uid: number; address: string }[]
  >([]);
  useEffect(() => {
    if (!contractUid) return;

    Promise.all([
      apiClient.get(`/contracts/${contractUid}`),
      apiClient.get("/properties"),
      apiClient.get("/customers"),
    ]).then(([contractRes, propertiesRes, customersRes]) => {
      const data = contractRes.data.data;

      const allCustomers = customersRes.data.data.customers.map(
        (c: CustomerResponse) => ({
          uid: Number(c.uid),
          name: c.name,
        })
      );
      setCustomerOptions(allCustomers);

      const allProperties = propertiesRes.data.data.agentProperty.map(
        (p: AgentPropertyResponse) => ({
          uid: p.uid,
          address: p.address,
        })
      );
      setPropertyOptions(allProperties);

      setLessorUids(
        (data.lessorOrSellerNames ?? [])
          .map((name: string) => {
            const found = allCustomers.find((c: { uid: number; name: string }) => c.name === name);
            return found ? found.uid : null;
          })
          .filter((uid: number | null): uid is number => uid !== null)
      );
      setLesseeUids(
        (data.lesseeOrBuyerNames ?? [])
          .map((name: string) => {
            const found = allCustomers.find((c: { uid: number; name: string }) => c.name === name);
            return found ? found.uid : null;
          })
          .filter((uid: number | null): uid is number => uid !== null)
      );

      const matchedProperty = allProperties.find(
        (p: { address: AgentPropertyResponse }) =>
          p.address === data.propertyAddress
      );
      setPropertyUid(matchedProperty?.uid ?? null);

      setCategory(data.category === "null" || data.category === undefined ? null : data.category);
      setContractDate(data.contractDate ? dayjs(data.contractDate) : null);
      setContractStartDate(
        data.contractStartDate ? dayjs(data.contractStartDate) : null
      );
      setContractEndDate(
        data.contractEndDate ? dayjs(data.contractEndDate) : null
      );
      setExpectedContractEndDate(
        data.expectedContractEndDate
          ? dayjs(data.expectedContractEndDate)
          : null
      );
      setDeposit(data.deposit?.toString() ?? "");
      setMonthlyRent(data.monthlyRent?.toString() ?? "");
      setPrice(data.price?.toString() ?? "");
      setStatus(data.status ?? "");

      setExistingDocuments(
        (data.documents ?? []).map((doc: ContractDocument) => ({
          documentName: doc.fileName,
          documentUrl: doc.fileUrl,
          deleted: false,
        }))
      );
    });
  }, [contractUid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
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
    lessorUid?: string;
    lesseeUid?: string;
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

    if (!lessorUids.length) newErrors.lessorUid = "임대/매도자를 선택해 주세요.";
    if (lessorUids.length > 1 && lesseeUids.length > 1 && lessorUids.some(id => lesseeUids.includes(id))) {
      newErrors.lesseeUid = "임대자와 임차자는 같을 수 없습니다.";
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
      category,
      contractDate: contractDate?.format("YYYY-MM-DD") ?? null,
      contractStartDate: contractStartDate?.format("YYYY-MM-DD") ?? null,
      contractEndDate: contractEndDate?.format("YYYY-MM-DD") ?? null,
      expectedContractEndDate:
        expectedContractEndDate?.format("YYYY-MM-DD") ?? null,
      deposit: deposit ? parseInt(deposit, 10) : 0,
      monthlyRent: monthlyRent ? parseInt(monthlyRent, 10) : 0,
      price: price ? parseInt(price, 10) : 0,
      lessorOrSellerUids: lessorUids,
      lesseeOrBuyerUids: lesseeUids,
      propertyUid,
      status,
    };

    const docsToKeep = existingDocuments
      .filter((doc) => !doc.deleted)
      .map((doc) => ({
        fileName: doc.documentName,
        fileUrl: doc.documentUrl,
      }));
    const formData = new FormData();
    formData.append(
      "existingDocuments",
      new Blob([JSON.stringify(docsToKeep)], { type: "application/json" })
    );

    formData.append(
      "contractRequestDTO",
      new Blob([JSON.stringify(requestPayload)], { type: "application/json" })
    );
    newFiles.forEach((file) => formData.append("files", file));

    apiClient
      .patch(`/contracts/${contractUid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("계약 수정 완료!");
        fetchContractData();
        handleClose();
      })
      .catch((err) => {        
        toast.error("계약 수정 실패", err);
      });
  };

  const removeExistingDoc = (idx: number) => {
    const updated = [...existingDocuments];
    updated[idx].deleted = true;
    setExistingDocuments(updated);
  };

  const removeNewFile = (idx: number) => {
    const updated = [...newFiles];
    updated.splice(idx, 1);
    setNewFiles(updated);
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
          계약 수정
        </Typography>

        <TextField
          select
          label="계약 카테고리"
          value={category ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setCategory(val === "" ? null : val);
          }}
          
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
          label="계약 상태"
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
            renderValue: (selected: unknown) => {
              const arr = selected as number[];
              return arr.length === 0
                ? undefined
                : arr
                    .map((uid) => {
                      const customer = customerOptions.find(
                        (c) => c.uid === uid
                      );
                      return customer?.name || uid;
                    })
                    .join(", ");
            },
          }}
          error={!!errors.lessorUid}
          helperText={errors.lessorUid}
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
          value={lesseeUids}
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
            renderValue: (selected: unknown) => {
              const arr = selected as number[];
              return arr.length === 0
                ? undefined
                : arr
                    .map((uid) => {
                      const customer = customerOptions.find(
                        (c) => c.uid === uid
                      );
                      return customer?.name || uid;
                    })
                    .join(", ");
            },
          }}
          error={!!errors.lesseeUid}
          helperText={errors.lesseeUid}
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
          label="매물 선택"
          value={propertyUid !== null ? String(propertyUid) : ""}
          onChange={(e) => setPropertyUid(Number(e.target.value))}
          error={!!errors.propertyUid}
          helperText={errors.propertyUid}
          fullWidth
          sx={{ mb: 2 }}
        >
          {propertyOptions.map((p) => (
            <MenuItem key={p.uid} value={String(p.uid)}>
              {p.address}
            </MenuItem>
          ))}
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
          파일 선택
          <input type="file" hidden multiple onChange={handleFileChange} />
        </MuiButton>

        {(existingDocuments.filter((doc) => !doc.deleted).length > 0 ||
          newFiles.length > 0) && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 1 }} fontWeight="bold">
              첨부한 문서
            </Typography>

            {[
              ...existingDocuments.filter((doc) => !doc.deleted),
              ...newFiles,
            ].map((item, idx) => {
              const isExisting = "documentUrl" in item;
              const fileName = isExisting ? item.documentName : item.name;
              const fileSize = !isExisting
                ? (item.size / 1024 / 1024).toFixed(2) + " MB"
                : null;

              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <InsertDriveFile color="action" />
                    {isExisting ? (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#333" }}
                      >
                        {fileName}
                      </a>
                    ) : (
                      <Typography>{fileName}</Typography>
                    )}
                    {fileSize && (
                      <Typography variant="caption" sx={{ color: "gray" }}>
                        ({fileSize})
                      </Typography>
                    )}
                  </Box>

                  <MuiButton
                    onClick={() => {
                      if (isExisting) {
                        const index = existingDocuments.findIndex(
                          (doc) => doc.documentUrl === item.documentUrl
                        );
                        removeExistingDoc(index);
                      } else {
                        const index = newFiles.findIndex(
                          (file) =>
                            file.name === item.name && file.size === item.size
                        );
                        removeNewFile(index);
                      }
                    }}
                    sx={{ minWidth: "auto", color: "red" }}
                  >
                    ❌
                  </MuiButton>
                </Box>
              );
            })}
          </Box>
        )}
        <Button
          text="수정"
          onClick={handleSubmit}
          sx={{ mt: 2, color: "white !important", backgroundColor: "#164F9E" }}
        />
      </Box>
    </Modal>
  );
};

export default ContractEditModal;
