export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">FreeVideo</h1>
      <p className="text-lg text-gray-400 mb-8">
        上传照片，输入文字，免费生成说话视频
      </p>
      <div className="text-sm text-gray-600">
        Powered by{" "}
        <a
          href="https://spatialreal.ai"
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          SpatialReal SDK
        </a>
      </div>
    </div>
  );
}
