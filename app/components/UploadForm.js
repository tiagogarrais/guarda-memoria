"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm({
  onUploadSuccess,
  userCity,
  parentId = null,
}) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const fileInputRef = useRef(null);
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
    data: "Data",
  };

  const handleFileSelect = (type) => {
    setShowAttachmentOptions(false);
    if (fileInputRef.current) {
      let acceptType = "";
      switch (type) {
        case "photo":
          acceptType = "image/*";
          break;
        case "video":
          acceptType = "video/*";
          break;
        case "music":
          acceptType = "audio/*";
          break;
        default:
          acceptType = "image/*,video/*,audio/*";
      }
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAudioBlob(null); // Limpar áudio se arquivo foi selecionado
    }
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
    if (!text.trim() && !file && !audioBlob) {
      setMessage("Adicione uma mensagem ou mídia");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (file) formData.append("file", file);
    if (audioBlob) formData.append("audio", audioBlob);
    if (selectedCategories.length > 0) {
      formData.append("categories", JSON.stringify(selectedCategories));
    }
    if (parentId) formData.append("parentId", parentId); // Novo campo para comentários

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Enviado com sucesso!");
        setText("");
        setFile(null);
        setAudioBlob(null);
        setSelectedCategories([]);
        setTimeout(() => setMessage(""), 3000);
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
    setFile(null);
    setAudioBlob(null);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
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
              placeholder="Compartilhe sua memória..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              rows={3}
            />

            {/* Botões de ação */}
            <div className="absolute bottom-2 right-2 flex space-x-2">
              {/* Botão de anexo */}
              <button
                type="button"
                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
                title="Anexar arquivo"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>

              {/* Botão de áudio */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording
                    ? "text-red-500 hover:text-red-600 bg-red-50"
                    : "text-gray-500 hover:text-blue-500 hover:bg-gray-100"
                }`}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                {isRecording ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
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
              </button>
            </div>
          </div>

          {/* Menu de opções de anexo */}
          {showAttachmentOptions && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleFileSelect("photo")}
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
                <button
                  type="button"
                  onClick={() => handleFileSelect("video")}
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
                <button
                  type="button"
                  onClick={() => handleFileSelect("music")}
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
              </div>
            </div>
          )}

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

          {/* Preview do anexo */}
          {(file || audioBlob) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {file && file.type.startsWith("image/") && (
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
                        Foto: {file.name}
                      </span>
                    </div>
                  )}
                  {file && file.type.startsWith("video/") && (
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
                        Vídeo: {file.name}
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
                        Áudio gravado
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
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || (!text.trim() && !file && !audioBlob)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
          </div>
        </form>

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

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
