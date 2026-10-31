import ServiceForm from "../ServiceForm";
import s from "../../../admin.module.css";

export default function NewService() {
  return (
    <>
      <div className={s.head}><div><h1>Add a service</h1><p>It stays a draft, hidden from the website, until you publish it.</p></div></div>
      <ServiceForm />
    </>
  );
}
