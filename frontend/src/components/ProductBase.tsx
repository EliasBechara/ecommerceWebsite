import { formatUSD } from "../utils/formatCurrency";

export const ProductBase = ({
  image,
  name,
  price,
  children,
}: {
  image: string;
  name: string;
  price: number;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex gap-3">
      <img
        src={image}
        alt={name}
        className="w-20 h-20 object-cover rounded bg-gray-200"
      />

      <div className="flex flex-col justify-between">
        <h2 className="text-sm font-medium uppercase">{name}</h2>
        <p className="text-sm text-gray-600">{formatUSD(price)}</p>

        {children}
      </div>
    </div>
  );
};
