import { Truck, RotateCcw, Shield, Gift, CreditCard, Clock } from "lucide-react";

const features = [
  { icon: Truck, text: "Free Delivery", sub: "On ₹999+" },
  { icon: RotateCcw, text: "Easy Returns", sub: "7 day policy" },
  { icon: Shield, text: "Secure Pay", sub: "100% safe" },
  { icon: Gift, text: "Gift Wrap", sub: "Available" },
  { icon: CreditCard, text: "COD", sub: "Available" },
  { icon: Clock, text: "Fast Ship", sub: "3-5 days" },
];

export const MarqueeBanner = () => {
  return (
    <div className="bg-muted/40 border-y border-border py-3 sm:py-4">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          {features.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 min-w-fit px-2 sm:px-3"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 border border-accent/10">
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-foreground leading-tight">{item.text}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
