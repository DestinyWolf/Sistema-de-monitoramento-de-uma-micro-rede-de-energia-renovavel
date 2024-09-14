"use client"
import {DataSelectorStart, DataSelectorFinish, ChartsForMonth} from "../../components/charts/chartsForMonth";

export default function home() {
  //pagina referente a busca de dados por periodos de tempo
    return (
        <main className="flex-col min-h-screen pr-12 pl-12">
          <div className=" flex items-center justify-center text-center  ">
            <DataSelectorStart/>
            <DataSelectorFinish/>
          </div>
          
          <div className=" flex-col border-2 border-black  justify-center items-center">
              <ChartsForMonth/>
          </div>
        </main>
      );
}