"use client"
import {DataSelector, ChartsForDay} from "../../components/charts/chartsForDay"

export default function home() {
    //pagina responsavel pela exibição de dados referentes a um unico dia
    return(
        <main className="flex-col min-h-screen pr-12 pl-12">
            <div className="pt-4 items-center justify-center text-center">
                <DataSelector/>
            </div>
            <div>
                <ChartsForDay/>
            </div>
        </main>
    )
}