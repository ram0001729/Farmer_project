import BenefitSection from "@/components/common/BenefitSection";
import { useNavigate } from "react-router-dom";

function MiddleSection() {
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-16">

      <BenefitSection
        image="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769404657/6739180698b78019b9e96148e47f2ba2_og9aqv.jpg"
        title="Farmers Benefits"
        description="Everything farmers need in one trusted platform."
        benefits={[
          "Hire verified labour easily",
          "Access modern equipment",
          "Transparent pricing",
          "Local trusted providers",
  

        ]}
        ctaLabel="Become a Farmer"
  ctaRoute="/register?role=driver"

      />

      <BenefitSection
        image="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405972/ChatGPT_Image_Jan_26_2026_11_09_15_AM_b13az0.png"
        title="Labour Benefits"
        description="More work opportunities with fair pay."
        benefits={[
          "Nearby job discovery",
          "Daily and seasonal work",
          "Secure payments",
          "No middlemen",
        ]}
        reverse
        ctaLabel="Join as Labour"
  ctaRoute="/register?role=labour"

      />

      <BenefitSection
        image="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769405806/ChatGPT_Image_Jan_26_2026_11_06_28_AM_u7qffy.png"
        title="Drivers Benefits"
        description="Transport agricultural goods efficiently."
        benefits={[
          "Regular trip requests",
          "Flexible schedule",
          "Direct payments",
          "Fuel cost transparency",
        ]}
        ctaLabel="Become a Driver"
  ctaRoute="/register?role=driver"

      />

      <BenefitSection
        image="https://res.cloudinary.com/dwp9qjmdf/image/upload/v1769406385/ChatGPT_Image_Jan_26_2026_11_15_51_AM_nyel1g.png"
        title="Equipment Providers Benefits"
        description="Earn more from your idle equipment."
        benefits={[
          "Higher utilization",
          "Trusted bookings",
          "Automated scheduling",
          "On-time payments",
        ]}
        ctaLabel="Become a Equipment Provider"
  ctaRoute="/register?role=driver"

      />
          </div>

    </>
  );
}

export default MiddleSection;
