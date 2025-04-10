import { useState } from "react";
import ContractAddModal from "./ContractAddModal";
import Button from "@components/Button";

interface Props {
  fetchContractData: () => void;
}

const ContractAddButtonList = ({ fetchContractData }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Button
        text="계약 등록"
        onClick={handleOpenModal}
        sx={{
          backgroundColor: "#2E5D9F",
          color: "white",
          "&:hover": {
            backgroundColor: "#1E4A8B",
          },
        }}
      />
      <ContractAddModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        fetchContractData={fetchContractData}
      />
    </>
  );
};

export default ContractAddButtonList;