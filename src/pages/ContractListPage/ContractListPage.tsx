import { useEffect, useState, useCallback } from "react";
import apiClient from "@apis/apiClient";
import { Box, Typography, CircularProgress } from "@mui/material";
import ContractTable from "./ContractTable";
import ContractAddButtonList from "./ContractAddButtonList";
import ContractDetailModal from "./ContractAddButtonList/ContractDetailModal/ContractDetailModal";


export interface ContractItem {
  uid: number;
  category: string;
  contractDate: string;
  contractStartDate: string;
  contractEndDate: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  customerName: string;
}

function ContractListPage() {
  const [contractList, setContractList] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(
    null
  );
  const handleCloseDetailModal = () => setSelectedContract(null);

  const fetchContractData = useCallback(() => {
    setLoading(true);

    apiClient
      .get("/contracts")
      .then((res) => {
        const contractData = res?.data?.data?.contracts;
        if (contractData) {
          setContractList(contractData);
        } else {
          setContractList([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch contracts:", error);
        setContractList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  useEffect(() => {
    console.log("불러온 계약 리스트:", contractList);
  }, [contractList]);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );

  return (
    <Box sx={{ padding: "32px" }}>
      <div className="flex items-center justify-between">
        <Typography
          variant="h6"
          sx={{ mb: 2, minWidth: "max-content", display: "inline", margin: 0 }}
        >
          내 계약 목록
        </Typography>
        <ContractAddButtonList fetchContractData={fetchContractData} />
      </div>

      <ContractTable
        contractList={contractList}
        onRowClick={(contract: ContractItem) => setSelectedContract(contract)}
      />
      <ContractDetailModal
        open={!!selectedContract}
        onClose={handleCloseDetailModal}
        contract={selectedContract}
      />
    </Box>
  );
}

export default ContractListPage;
