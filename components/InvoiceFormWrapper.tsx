"use client";
import dynamic from "next/dynamic";

const InvoiceForm = dynamic(() => import("./InvoiceForm"), {
  ssr: false,
});

export default function InvoiceFormWrapper() {
  return <InvoiceForm />;
}
