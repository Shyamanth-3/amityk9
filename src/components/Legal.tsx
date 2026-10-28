import Nav from "./Nav";
import Footer from "./Footer";
import s from "./Legal.module.css";

// Shared shell for the short policy pages
export default function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className={`wrap ${s.page}`}>
        <nav aria-label="Breadcrumb" className={s.crumbs}><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
        <h1 className={s.h1}>{title}</h1>
        <p className={s.updated}>Last updated {updated}</p>
        <div className={s.body}>{children}</div>
      </main>
      <Footer />
    </>
  );
}
