import TextareaAutosize from "react-textarea-autosize";

export default function Textarea({ ...props }) {
  return (
    <TextareaAutosize
      {...props}
      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  );
}
