import RibbonCard from "./RibbonCard";
import { CARDS } from "../data/mock";
export default function CardsGrid(){
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h3 className="text-xl font-bold mb-4">Свежие карточки</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CARDS.map((x,i)=>(<RibbonCard key={i} {...x}/>))}
      </div>
    </section>
  );
}
