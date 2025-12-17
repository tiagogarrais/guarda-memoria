"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

export default function UploadForm({
  onUploadSuccess,
  userCity,
  parentId = null,
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [cloudinaryResult, setCloudinaryResult] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const router = useRouter();

  // Definição das categorias organizadas por grupos
  const categoryGroups = {
    "🏛️ Locais & Espaços": [
      "lugar",
      "arquitetura",
      "natureza",
      "comercio",
      "transporte",
      "religiao",
      "organizacao",
    ],
    "👥 Pessoas & História": ["pessoa", "educacao", "esporte"],
    "🎭 Cultura & Tradições": [
      "evento",
      "tradiccao",
      "lenda",
      "comida",
      "artesanato",
      "musica",
    ],
    "🎨 Artes & Criatividade": [
      "pintura",
      "escultura",
      "fotografia",
      "video",
      "poesia",
      "livro",
    ],
    "📅 Tempo & Marcos": ["data"],
  };

  const categoryLabels = {
    lugar: "Lugar",
    arquitetura: "Arquitetura",
    natureza: "Natureza",
    comercio: "Comércio",
    transporte: "Transporte",
    religiao: "Religião",
    organizacao: "Organização",
    pessoa: "Pessoa",
    educacao: "Educação",
    esporte: "Esporte",
    evento: "Evento",
    tradiccao: "Tradição",
    lenda: "Lenda",
    comida: "Comida",
    artesanato: "Artesanato",
    musica: "Música",
    pintura: "Pintura",
    escultura: "Escultura",
    fotografia: "Fotografia",
    video: "Vídeo",
    poesia: "Poesia",
    livro: "Livro",
    data: "Data",
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });

        // Validar tamanho do áudio (250MB máximo)
        const maxSize = 250 * 1024 * 1024; // 250MB
        if (blob.size > maxSize) {
          setMessage(
            `Áudio muito grande. Máximo permitido: 250MB. Tamanho atual: ${(
              blob.size /
              (1024 * 1024)
            ).toFixed(2)}MB`
          );
          return;
        }

        setAudioBlob(blob);
        setFile(null); // Limpar arquivo se áudio foi gravado
        // Parar todas as tracks do stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      setMessage("Erro ao acessar microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar se há pelo menos texto ou mídia
    if (!text.trim() && !cloudinaryResult) {
      setMessage("Adicione uma mensagem ou mídia");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Preparar dados para enviar à API
      const uploadData = {
        text: text.trim() || null,
        categories:
          selectedCategories.length > 0
            ? JSON.stringify(selectedCategories)
            : null,
        parentId: parentId || null,
      };

      // Se há resultado do Cloudinary, adicionar os dados
      if (cloudinaryResult) {
        uploadData.publicId = cloudinaryResult.public_id;
        uploadData.url = cloudinaryResult.secure_url;
        uploadData.resourceType = cloudinaryResult.resource_type;
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Enviado com sucesso!");
        setText("");
        setCloudinaryResult(null);
        setSelectedCategories([]);
        setTimeout(() => {
          setMessage("");
          window.location.reload(); // Refresh da página após sucesso
        }, 1000); // Reduzido para 1 segundo para dar tempo de ver a mensagem
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setMessage(result.error || "Erro no envio");
      }
    } catch (error) {
      setMessage("Erro de conexão");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    setCloudinaryResult(null);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Callbacks para o upload do Cloudinary
  const handleUploadSuccess = (result) => {
    console.log("Upload success:", result);
    if (result && result.info) {
      setCloudinaryResult({
        public_id: result.info.public_id,
        secure_url: result.info.secure_url,
        resource_type: result.info.resource_type,
      });
      setMessage("Arquivo enviado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    let errorMessage = "Erro no upload";
    if (error && error.message) {
      errorMessage += ": " + error.message;
    } else if (error && typeof error === "string") {
      errorMessage += ": " + error;
    }
    setMessage(errorMessage);
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {userCity
              ? `${userCity.name}${
                  userCity.stateSigla
                    ? ` - ${userCity.stateSigla.toUpperCase()}`
                    : ""
                }`
              : ""}
          </h2>
          {userCity && (
            <button
              type="button"
              onClick={() => router.push("/select-location")}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition-colors flex items-center space-x-1"
              title="Trocar cidade"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span>Trocar cidade</span>
            </button>
          )}
        </div>

        {/* Área de texto e controles */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Campo de texto */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Envie aqui seu comentário, poesia, música..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              rows={3}
              lang="pt-BR"
            />
          </div>

          {/* Menu de opções de anexo */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <CldUploadWidget
                options={{
                  maxFiles: 10,
                  resourceType: "image",
                  folder: "guarda-memoria",
                  maxFileSize: 250 * 1024 * 1024, // 250MB
                  clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "webp"],
                  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                  uploadPreset: "ml_default",
                }}
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={open}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">Foto</span>
                  </button>
                )}
              </CldUploadWidget>

              <CldUploadWidget
                options={{
                  maxFiles: 10,
                  resourceType: "video",
                  folder: "guarda-memoria",
                  maxFileSize: 250 * 1024 * 1024, // 250MB
                  clientAllowedFormats: [
                    "mp4",
                    "avi",
                    "mov",
                    "wmv",
                    "flv",
                    "webm",
                    "mkv",
                  ],
                  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                  uploadPreset: "ml_default",
                }}
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={open}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">Vídeo</span>
                  </button>
                )}
              </CldUploadWidget>

              <CldUploadWidget
                options={{
                  maxFiles: 10,
                  resourceType: "video", // Cloudinary trata audio como video
                  folder: "guarda-memoria",
                  maxFileSize: 250 * 1024 * 1024, // 250MB
                  clientAllowedFormats: [
                    "mp3",
                    "wav",
                    "aac",
                    "ogg",
                    "wma",
                    "flac",
                    "m4a",
                  ],
                  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                  uploadPreset: "ml_default",
                }}
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={open}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    <span className="text-sm">Música</span>
                  </button>
                )}
              </CldUploadWidget>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  isRecording
                    ? "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                {isRecording ? (
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
                <span className="text-sm">
                  {isRecording ? "Parar" : "Áudio"}
                </span>
              </button>
            </div>
          </div>

          {/* Preview do anexo */}
          {cloudinaryResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {cloudinaryResult.resource_type === "image" && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        A foto está pronta para ser enviada. Que tal escrever um
                        comentário falando mais sobre ela?
                      </span>
                    </div>
                  )}
                  {cloudinaryResult.resource_type === "video" && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        O vídeo está pronto para ser enviado. Que tal escrever
                        um comentário contando a história por trás dele?
                      </span>
                    </div>
                  )}
                  {audioBlob && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        O áudio está pronto para ser enviado. Que tal escrever
                        um comentário explicando o que ele representa?
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remover anexo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Botão de enviar */}
          <button
            type="submit"
            disabled={
              uploading || (!text.trim() && !cloudinaryResult && !audioBlob)
            }
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>Enviar</span>
              </>
            )}
          </button>

          {/* Categorias da publicação */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <button
              type="button"
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors mb-3"
            >
              <div className="flex items-center">
                <span className="mr-2">🏷️</span>
                CATEGORIAS DA PUBLICAÇÃO
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (opcional)
                </span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${
                  categoriesExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {categoriesExpanded && (
              <div className="space-y-4">
                {Object.entries(categoryGroups).map(
                  ([groupName, categories]) => (
                    <div key={groupName} className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {groupName}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((category) => (
                          <label
                            key={category}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryChange(category)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-gray-700">
                              {categoryLabels[category]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {selectedCategories.length > 0 && !categoriesExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Categorias selecionadas:{" "}
                  {selectedCategories
                    .map((cat) => categoryLabels[cat])
                    .join(", ")}
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Mensagem de status */}
        {message && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              message.includes("sucesso") || message.includes("Sucesso")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
