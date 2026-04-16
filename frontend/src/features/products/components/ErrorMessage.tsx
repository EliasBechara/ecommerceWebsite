type ErrorMessageProps = {
  message?: string;
};

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="flex items-center justify-center h-50 w-full">
      <h1 className="text-[20px]">
        {message || "Oops... Something went wrong! Try again later"}
      </h1>
    </div>
  );
};
