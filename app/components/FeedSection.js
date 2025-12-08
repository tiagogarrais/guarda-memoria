"use client";

import { useState } from "react";
import UploadForm from "./UploadForm";
import MediaFeed from "./MediaFeed";

export default function FeedSection() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Incrementa o trigger para forçar atualização do feed
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <UploadForm onUploadSuccess={handleUploadSuccess} />
      <MediaFeed refreshTrigger={refreshTrigger} />
    </>
  );
}
