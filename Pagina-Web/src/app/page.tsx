"use client"
import {EletricCurrentChart} from "./components/charts/realTimeChats";
import {LastDateInApi} from "./components/util/tabBar";

export default function Home() {
  //pagina principal da aplicação
    return (
      <main className="flex-col min-h-screen pl-12 pr-12">
        <div className=" flex-col justify-center items-center">
          <LastDateInApi/>
          <EletricCurrentChart/>
        </div>
      </main>
    );
}
