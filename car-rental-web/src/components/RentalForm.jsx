import { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import checkIcon from "../assets/check-outline.svg";
import infoIcon from "../assets/info.svg";

export default function RentalForm({ car, onCancel, onConfirmPending }) {
  const defaultForm = {
    name: "",
    phone: "",
    email: "",
    license: "",
    start: "",
    end: "",
  };
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("rentalForm");
    return saved ? JSON.parse(saved) : defaultForm;
  });
  // Load form from localStorage on mount
  useEffect(() => {
    const savedForm = localStorage.getItem("rentalForm");
    if (savedForm) {
      const parsed = JSON.parse(savedForm);
      const isEmpty = Object.values(form).every(value => value === "");
      if (isEmpty) {
        setForm(parsed);
      }
    }
  }, []);

  // Persist form to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("rentalForm", JSON.stringify(form));
  }, [form]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const newErrors = {};

    if (form.name && !form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (form.phone && !/^(\(04\)|04)\d{8}$/.test(form.phone)) {
      newErrors.phone = "Invalid Australia number, start with (04), 10 digits total";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (form.license && !/^([A-Z]{1,3}\d{5,6}|[A-Z]{2}\d{6})$/.test(form.license)) {
      newErrors.license = "Invalid driver's license. Example: NSW123456 or ABC12345";
    }

    if (form.start && form.end && new Date(form.start) >= new Date(form.end)) {
      newErrors.date = "Start and end date are required and must be valid";
    }

    setErrors(newErrors);
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const calculateRentalDetails = (startDate, endDate, pricePerDay) => {
    const days = startDate && endDate
      ? Math.max(
          1,
          Math.floor(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
    const total = days === 0 ? "0.00" : (pricePerDay * days).toFixed(2);
    return { days, total };
  };

  const validateForm = (formData) => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!/^(\(04\)|04)\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Invalid Australia number, start with (04), 10 digits total";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!/^([A-Z]{1,3}\d{5,6}|[A-Z]{2}\d{6})$/.test(formData.license)) {
      newErrors.license = "Invalid driver's license. Example: NSW123456 or ABC12345";
    }

    if (!formData.start || !formData.end || new Date(formData.start) >= new Date(formData.end)) {
      newErrors.date = "Start and end date are required and must be valid";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onConfirmPending(); // Show confirmation modal
    try {
      setIsSubmitting(true);
      
      // Validate form
      const validationErrors = validateForm(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        throw new Error("Please fix the errors in the form before submitting");
      }

      // Calculate rental details
      const { days, total } = calculateRentalDetails(form.start, form.end, car?.price || 0);

      // Prepare submission data
      const rentalSubmission = {
        id: crypto.randomUUID(), // Generate unique ID
        customerInfo: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          license: form.license
        },
        rentalInfo: {
          startDate: form.start,
          endDate: form.end,
          days: days,
          pricePerDay: car?.price || 0,
          totalPrice: total
        },
        carInfo: {
          id: car?.id,
          vin: car?.vin,
          model: car?.model,
          brand: car?.brand
        },
        status: 'pending',
        submittedAt: new Date().toISOString(),
        metadata: {
          browser: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Log form information as a single object
      console.log('Rental Submission:', rentalSubmission);

      // Here you would make an API call to save the reservation
      // const response = await rentalService.createRental(rentalSubmission);
      
      // KHÔNG XÓA form tại đây nữa
      // setForm(defaultForm);
      // localStorage.removeItem("rentalForm");
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePerDay = car?.price || 0;
  const days =
    form.start && form.end
      ? Math.max(
          1,
          Math.floor(
            (new Date(form.end).getTime() - new Date(form.start).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const total = days === 0 ? "0.00" : (pricePerDay * days).toFixed(2);

  const isFormValid =
    Object.keys(errors).length === 0 &&
    form.name &&
    form.phone &&
    form.email &&
    form.license &&
    form.start &&
    form.end;

  return (
    <div className="w-[668px] self-stretch bg-white rounded shadow-[0px_4px_8px_0px_rgba(10,26,40,0.02)] outline outline-1 outline-offset-[-1px] outline-zinc-300 inline-flex flex-col justify-start items-start overflow-hidden">
      <div className="self-stretch px-5 pt-5 inline-flex justify-start items-center gap-12">
        <div className="flex-1 flex justify-start items-center gap-3">
          <div className="text-yellow-600 text-xl font-bold font-['Arial'] uppercase leading-7">
            RENTAL DETAILS
          </div>
        </div>
      </div>
      <div className="self-stretch flex-1 px-5 py-6 flex flex-col justify-start items-start overflow-hidden">
        <div className="self-stretch flex-1 flex flex-col justify-between items-start">
          <div className="self-stretch pb-4 flex flex-col justify-start items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-start gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">
                  Name<span className="text-red-500">*</span>:
                </label>
                <div
                  className={`h-11 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] inline-flex items-center gap-2 ${
                    errors.name
                      ? "outline-red-500"
                      : form.name
                      ? "outline-zinc-200"
                      : "outline-zinc-200"
                  }`}
                >
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your name"
                    className="flex-1 bg-transparent text-black placeholder-zinc-400 text-base font-normal font-['Arial'] leading-snug tracking-tight w-full outline-none"
                    title={errors.name || ""}
                    onKeyDown={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />
                  {form.name && (
                    <div className="relative group">
                      <img
                        src={errors.name ? infoIcon : checkIcon}
                        className="w-5 h-5"
                        alt={errors.name ? "Invalid" : "Valid"}
                      />
                      {touched.name && errors.name && (
                        <div className="absolute bottom-full right-0 mb-1 bg-red-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {errors.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-52 flex flex-col gap-2">
                <label className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">
                  Phone number<span className="text-red-500">*</span>:
                </label>
                <div
                  className={`h-11 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] inline-flex items-center gap-2 ${
                    errors.phone
                      ? "outline-red-500"
                      : form.phone
                      ? "outline-zinc-200"
                      : "outline-zinc-200"
                  }`}
                >
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setForm({ ...form, phone: raw });
                    }}
                    onBlur={handleBlur}
                    placeholder="(04)"
                    className="flex-1 bg-transparent text-black placeholder-zinc-400 text-base font-normal font-['Arial'] leading-snug tracking-tight w-full outline-none"
                    title={errors.phone || ""}
                    inputMode="numeric"
                    pattern="\d*"
                    onPaste={(e) => { if (!/^\d+$/.test(e.clipboardData.getData('text'))) e.preventDefault(); }}
                    onKeyDown={(e) => {
                      const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];
                      if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {form.phone && (
                    <div className="relative group">
                      <img
                        src={errors.phone ? infoIcon : checkIcon}
                        className="w-5 h-5"
                        alt={errors.phone ? "Invalid" : "Valid"}
                      />
                      {touched.phone && errors.phone && (
                        <div className="absolute bottom-full right-0 mb-1 bg-red-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="self-stretch inline-flex justify-start items-start gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">
                  Email<span className="text-red-500">*</span>:
                </label>
                <div
                  className={`h-11 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] inline-flex items-center gap-2 ${
                    errors.email
                      ? "outline-red-500"
                      : form.email
                      ? "outline-zinc-200"
                      : "outline-zinc-200"
                  }`}
                >
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent text-black placeholder-zinc-400 text-base font-normal font-['Arial'] leading-snug tracking-tight w-full outline-none"
                    title={errors.email || ""}
                  />
                  {form.email && (
                    <div className="relative group">
                      <img
                        src={errors.email ? infoIcon : checkIcon}
                        className="w-5 h-5"
                        alt={errors.email ? "Invalid" : "Valid"}
                      />
                      {touched.email && errors.email && (
                        <div className="absolute bottom-full right-0 mb-1 bg-red-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-52 flex flex-col gap-2">
                <label className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">
                  Driver's license number<span className="text-red-500">*</span>:
                </label>
                <div
                  className={`h-11 px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] inline-flex items-center gap-2 ${
                    errors.license
                      ? "outline-red-500"
                      : form.license
                      ? "outline-zinc-200"
                      : "outline-zinc-200"
                  }`}
                >
                  <input
                    name="license"
                    value={form.license}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="NSW(00)"
                    className="flex-1 bg-transparent text-black placeholder-zinc-400 text-base font-normal font-['Arial'] leading-snug tracking-tight w-full outline-none"
                    title={errors.license || ""}
                  />
                  {form.license && (
                    <div className="relative group">
                      <img
                        src={errors.license ? infoIcon : checkIcon}
                        className="w-5 h-5"
                        alt={errors.license ? "Invalid" : "Valid"}
                      />
                      {touched.license && errors.license && (
                        <div className="absolute bottom-full right-0 mb-1 bg-red-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {errors.license}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DatePicker startDate={form.start} endDate={form.end} onChange={handleChange} />

          <div className="self-stretch py-4 flex flex-col justify-start items-start gap-3">
            <div className="self-stretch h-8 py-2 inline-flex justify-between items-center">
              <span className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">Price (per day)</span>
              <span className="text-zinc-700 text-xl font-normal font-['Arial'] leading-7 tracking-tight">${pricePerDay}</span>
            </div>
            <div className="self-stretch h-8 py-2 inline-flex justify-between items-center">
              <span className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">Rental period (day)</span>
              <span className="text-zinc-700 text-xl font-normal font-['Arial'] leading-7 tracking-tight">{days}</span>
            </div>
            <div className="self-stretch h-8 py-2 inline-flex justify-between items-center">
              <span className="text-neutral-500 text-lg font-normal font-['Arial'] leading-7 tracking-tight">Total price</span>
              <span className="text-yellow-600 text-2xl font-semibold font-['Arial'] leading-7">${total}</span>
            </div>
          </div>
        </div>

        <div className="self-stretch h-12 inline-flex justify-start items-start gap-3">
          <button
            type="button"
            onClick={() => {
              onCancel(car.vin);
            }}
            className="w-28 self-stretch px-5 bg-white rounded-lg shadow-sm outline outline-1 outline-offset-[-1px] outline-zinc-200"
          >
            <span className="justify-center text-neutral-500 text-base font-bold  leading-snug tracking-tight">Cancel</span>
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`flex-1 self-stretch px-5 py-1 rounded-lg shadow-sm ${
              isFormValid
                ? 'bg-[rgba(231,170,76,1)] hover:bg-yellow-500'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!isFormValid || isSubmitting}
          >
            <span className="justify-start text-white text-base font-bold leading-normal">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}