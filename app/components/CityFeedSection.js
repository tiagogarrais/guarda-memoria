"use client";

import { useState } from "react";
import UploadForm from "./UploadForm";
import MediaFeed from "./MediaFeed";

export default function CityFeedSection({ cityId, cityName }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Incrementa o trigger para forçar atualização do feed
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <UploadForm
        onUploadSuccess={handleUploadSuccess}
        userCity={{ id: cityId, name: cityName }}
      />
      <MediaFeed cityId={cityId} refreshTrigger={refreshTrigger} />
    </>
  );
}
