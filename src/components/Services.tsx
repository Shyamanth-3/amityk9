import Image from "next/image";
import beagle from "@/assets/walking-beagle.webp";
import cat from "@/assets/sitting-cat.webp";
import { Icon } from "./Icons";
import s from "./Services.module.css";
import { DogSniff, Sprig } from "./Doodles";
import d from "./Doodles.module.css";

export default function Services() {
  return (
    <section className={s.services} id="services">
      <div className="wrap">
        <div className="sec-head" data-rv>
          <div><p className="eyebrow"><span className="num">01</span><span className="rule" />What we do</p><h2>Two ways we look after them <em>while you&apos;re busy.</em></h2></div>
          <p>Pick walks, home visits, or a mix across the month. Either way it&apos;s the same small team, inside your community, on a schedule you set.</p>
        </div>
        <div className={s.cards} data-rvg>
          <article className={`${s.svc} ${s.walk}`} data-tilt>
            <figure className={s.mini}>
              <Image src={beagle} alt="Beagle sniffing the grass mid-walk with an AmityK9 walker" placeholder="blur" sizes="(max-width: 640px) 46vw, 240px" />
              <figcaption>Coco, mid-walk</figcaption>
            </figure>
            <p className={s.tag}><Icon id="paw" />Pet walking</p>
            <p className={s.big}>~30<small>min per walk</small></p>
            <h3>Daily exercise, fresh air and a happier, healthier pet.</h3>
            <ul><li>Safe, supervised walks</li><li>Fresh air and exercise</li><li>Suitable for all breeds and sizes</li><li>Update after each walk, photos if you like</li></ul>
            <a className={s.foot} href="/pet-walking-hyderabad"><span>3 to 6 walks a week · from ₹2,499 / month</span><strong>About pet walking →</strong></a>
          </article>
          <article className={`${s.svc} ${s.sit}`} data-tilt>
            <figure className={s.mini}>
              <Image src={cat} alt="Cat being petted during an AmityK9 home visit" placeholder="blur" sizes="(max-width: 640px) 46vw, 240px" />
              <figcaption>Mochi, at home</figcaption>
            </figure>
            <p className={s.tag}><Icon id="paw" />Pet sitting</p>
            <p className={s.big}>45–60<small>min per visit</small></p>
            <h3>Loving care for your pet when you&apos;re away.</h3>
            <ul><li>Feeding and fresh water</li><li>Playtime and company</li><li>Litter box and clean-up</li><li>Medicines, if required</li><li>Regular photo updates</li><li>Timings extended on request</li></ul>
            <a className={s.foot} href="/pet-sitting-hyderabad"><span>Extra hours · ₹599 for 4 hours</span><strong>About pet sitting →</strong></a>
          </article>
        </div>
      </div>
      <DogSniff className={d.servicesDog} />
      <Sprig className={d.servicesSprig} />
    </section>
  );
}
