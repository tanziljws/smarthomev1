export default function MessageItem({ topic, message, timestamp }) {
    return (
      <div className="border p-3 rounded-lg bg-gray-50">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-700">Topic: {topic}</p>
          <span className="text-sm text-gray-500">{timestamp}</span>
        </div>
        <div className="mt-1 text-gray-600">
          {(() => {
            try {
              const jsonMessage = JSON.parse(message)
              return (
                <div className="bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(jsonMessage, null, 2)}
                  </pre>
                </div>
              )
            } catch {
              return <p>{message}</p>
            }
          })()}
        </div>
      </div>
    )
  } 
