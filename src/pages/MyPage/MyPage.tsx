import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, TextField, Typography, Button as MuiButton } from "@mui/material";
import Button from "@components/Button";
import useUserStore from "@stores/useUserStore";
import apiClient from "@apis/apiClient";
import useInput from "@hooks/useInput";
import { formatDate } from "@utils/dateUtil";

function MyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [cortarNo, handleCortarNo] = useInput("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile); // 파일 추가

      apiClient
        .post("/admin/upload-proxy-list", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // multipart 요청을 위한 헤더 설정
          },
        })
        .then(() => {
          console.log(`${selectedFile.name} 업로드 완료!`);
        })
        .catch((error) => {
          console.error("파일 업로드 실패:", error);
        });
    } else {
      alert("파일을 선택해주세요.");
    }
  };

  const triggerCrawler = () => {
    apiClient
      .get("/admin/crawl/region")
      .then(() => console.log("region 크롤링 완료"));
  };

  const startNaverMigration = () => {
    apiClient
      .post("/admin/NaverMigration/start")
      .then(() => console.log("naver 마이그레이션 시작"));
  };

  const crawlNaverAllWithProxy = () => {
    apiClient
      .get("/admin/crawl/naver-raw_p/articles/all")
      .then(() => console.log("네이버 전지역 크롤링(프록시)"));
  };

  const crawlNaverWithCortarNo = () => {
    apiClient
      .get(`/admin/crawl/naver-raw/articles/${cortarNo}`)
      .then(() => console.log("네이버 법정동코드 크롤링"));
  };

  const crawlNaverAll = () => {
    apiClient
      .get(`/admin/crawl/naver-raw/articles/all`)
      .then(() => console.log("네이버 전체 크롤링"));
  };

  const { user } = useUserStore();
  return (
    <Box sx={{ padding: "32px" }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, minWidth: "max-content", display: "inline", margin: 0 }}
      >
        마이페이지
      </Typography>
      {/* <Box>
        <Typography>내 정보</Typography>
        <Button text="비밀번호 변경" />
      </Box> */}

      <Box sx={{ marginTop: 4 }}>
        <Typography sx={{ marginBottom: 1 }}>내 설문</Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
            p: 3,
            backgroundColor: "#f9f9f9",
          }}
        >
          <div>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {user?.surveyTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "gray" }}>
              생성일:{" "}
              {user?.surveyCreatedAt ? formatDate(user?.surveyCreatedAt) : "-"}
            </Typography>
          </div>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <Link to="edit-survey">
              <Button
                text="수정"
                color="primary"
                sx={{
                  backgroundColor: "#2E5D9F",
                  color: "white",
                }}
              />
            </Link>
          </Box>
        </Box>
      </Box>
      {user?.role == "ROLE_ADMIN" && (
        <Box
          sx={{
            display: "grid",
            gap: 4,
            margin: 2,
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          <Button
            sx={{ border: "1px solid #2E5D9F" }}
            text="region 크롤링 트리거 버튼"
            onClick={triggerCrawler}
          />
          <Button
            sx={{ border: "1px solid #2E5D9F" }}
            text="네이버 데이터 마이그레이션"
            onClick={startNaverMigration}
          />
          <Button
            sx={{ border: "1px solid #2E5D9F" }}
            text="네이버 전지역 크롤링(프록시)"
            onClick={crawlNaverAllWithProxy}
          />
          <Button
            sx={{ border: "1px solid #2E5D9F" }}
            text="네이버 전체 크롤링"
            onClick={crawlNaverAll}
          />
          <TextField
            label="cortarNo"
            value={cortarNo}
            onChange={handleCortarNo}
          />
          <Button
            sx={{ border: "1px solid #2E5D9F" }}
            text="네이버 법정동코드 크롤링"
            onClick={crawlNaverWithCortarNo}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              border: "1px solid black",
              padding: "14px 0",
            }}
          >
            <Typography variant="h6">파일 업로드</Typography>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <MuiButton
                variant="outlined"
                component="span"
                sx={{ border: "1px solid #2E5D9F", color: "#2E5D9F" }}
              >
                파일 선택
              </MuiButton>
            </label>
            {selectedFile && (
              <Typography variant="body1">
                선택된 파일: {selectedFile.name}
              </Typography>
            )}
            <Button
              text=" 업로드"
              onClick={handleUpload}
              sx={{ border: "1px solid #2E5D9F" }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MyPage;
