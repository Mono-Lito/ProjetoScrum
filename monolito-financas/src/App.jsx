import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Trash2,
  Wallet,
  Landmark,
  Receipt,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const CATEGORIES = {
  receitas: {
    id: "receitas",
    title: "Receitas (O que entra)",
    icon: TrendingUp,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  fixas: {
    id: "fixas",
    title: "Despesas Fixas",
    icon: Wallet,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  variaveis: {
    id: "variaveis",
    title: "Contas do Mês",
    icon: Receipt,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  impostos: {
    id: "impostos",
    title: "Impostos",
    icon: Landmark,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
  objetivos: {
    id: "objetivos",
    title: "Objetivos Financeiros",
    icon: Target,
    color: "text-yellow-500",
    bg: "bg-neutral-800/50",
  },
};

const generateInitialState = () => {
  const year = new Date().getFullYear().toString();
  return {
    [year]: {
      Janeiro: {
        receitas: [{ id: "1", description: "Salário Exemplo", value: 5000 }],
        fixas: [{ id: "2", description: "Aluguel Exemplo", value: 1500 }],
        variaveis: [{ id: "3", description: "Mercado Exemplo", value: 800 }],
        impostos: [],
        objetivos: [],
      },
    },
  };
};

export default function App() {
  const [view, setView] = useState("home");
  const [activeYear, setActiveYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [activeMonth, setActiveMonth] = useState("Janeiro");

  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("monolito_data");
    return savedData ? JSON.parse(savedData) : generateInitialState();
  });

  const [baseSalary, setBaseSalary] = useState(() => {
    const savedSalary = localStorage.getItem("monolito_base_salary");
    return savedSalary || "5000";
  });

  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newMonth, setNewMonth] = useState(MONTHS[new Date().getMonth()]);

  useEffect(() => {
    localStorage.setItem("monolito_data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("monolito_base_salary", baseSalary);
  }, [baseSalary]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m] = val.split("-");
    setNewYear(y);
    setNewMonth(MONTHS[parseInt(m, 10) - 1]);
  };

  const monthIndex = MONTHS.indexOf(newMonth) + 1;
  const monthInputValue = `${newYear}-${monthIndex < 10 ? `0${monthIndex}` : monthIndex}`;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCreateMonth = (e) => {
    e.preventDefault();
    if (data[newYear] && data[newYear][newMonth]) {
      setActiveYear(newYear);
      setActiveMonth(newMonth);
      setView("dashboard");
      return;
    }
    const yearInt = parseInt(newYear);
    const monthIdx = MONTHS.indexOf(newMonth);
    let prevMonthIdx = monthIdx - 1;
    let prevYearInt = yearInt;
    if (prevMonthIdx < 0) {
      prevMonthIdx = 11;
      prevYearInt = yearInt - 1;
    }
    const prevMonthName = MONTHS[prevMonthIdx];
    const prevData = data[prevYearInt.toString()]?.[prevMonthName];
    const copyCategory = (items) =>
      items.map((item) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
      }));
    const baseData = prevData
      ? {
          receitas: copyCategory(prevData.receitas),
          fixas: copyCategory(prevData.fixas),
          variaveis: copyCategory(prevData.variaveis),
          impostos: copyCategory(prevData.impostos),
          objetivos: copyCategory(prevData.objetivos),
        }
      : {
          receitas:
            baseSalary && !isNaN(parseFloat(baseSalary))
              ? [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    description: "Salário Base",
                    value: parseFloat(baseSalary),
                  },
                ]
              : [],
          fixas: [],
          variaveis: [],
          impostos: [],
          objetivos: [],
        };
    setData((prev) => ({
      ...prev,
      [newYear]: { ...(prev[newYear] || {}), [newMonth]: baseData },
    }));
    setActiveYear(newYear);
    setActiveMonth(newMonth);
    setView("dashboard");
  };

  const openMonth = (year, month) => {
    setActiveYear(year);
    setActiveMonth(month);
    setView("dashboard");
  };

  const calculateTotal = (category) => {
    if (!data[activeYear] || !data[activeYear][activeMonth]) return 0;
    return data[activeYear][activeMonth][category].reduce(
      (acc, curr) => acc + Number(curr.value),
      0,
    );
  };

  const totalReceitas = calculateTotal("receitas");
  const totalDespesas =
    calculateTotal("fixas") +
    calculateTotal("variaveis") +
    calculateTotal("impostos") +
    calculateTotal("objetivos");
  const saldo = totalReceitas - totalDespesas;

  const handleAddItem = (category, description, value) => {
    if (!description || !value) return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      value: parseFloat(value),
    };
    setData((prev) => ({
      ...prev,
      [activeYear]: {
        ...prev[activeYear],
        [activeMonth]: {
          ...prev[activeYear][activeMonth],
          [category]: [...prev[activeYear][activeMonth][category], newItem],
        },
      },
    }));
  };

  const handleRemoveItem = (category, id) => {
    setData((prev) => ({
      ...prev,
      [activeYear]: {
        ...prev[activeYear],
        [activeMonth]: {
          ...prev[activeYear][activeMonth],
          [category]: prev[activeYear][activeMonth][category].filter(
            (item) => item.id !== id,
          ),
        },
      },
    }));
  };

  const CategorySection = ({ categoryKey }) => {
    const categoryInfo = CATEGORIES[categoryKey];
    const items = data[activeYear]?.[activeMonth]?.[categoryKey] || [];
    const [descInput, setDescInput] = useState("");
    const [valInput, setValInput] = useState("");
    const Icon = categoryInfo.icon;
    return (
      <div className='bg-[#111111] rounded-2xl border border-neutral-800/50 overflow-hidden flex flex-col h-full hover:bg-[#141414] transition-colors'>
        <div className='p-5 border-b border-neutral-800/50 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg ${categoryInfo.bg}`}>
              <Icon className={`w-5 h-5 ${categoryInfo.color}`} />
            </div>
            <h3 className='font-bold text-yellow-500 uppercase tracking-wider text-xs'>
              {categoryInfo.title}
            </h3>
          </div>
          <span className='font-bold text-white'>
            {formatCurrency(calculateTotal(categoryKey))}
          </span>
        </div>
        <div className='p-5 flex-1 overflow-y-auto min-h-[150px]'>
          {items.length === 0 ? (
            <div className='h-full flex items-center justify-center text-neutral-600 text-sm italic'>
              Vazio
            </div>
          ) : (
            <ul className='space-y-4'>
              {items.map((item) => (
                <li
                  key={item.id}
                  className='flex items-center justify-between group'>
                  <span className='text-neutral-300 text-sm font-medium'>
                    {item.description}
                  </span>
                  <div className='flex items-center gap-4'>
                    <span className='font-bold text-white text-sm'>
                      {formatCurrency(item.value)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(categoryKey, item.id)}
                      className='text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'>
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className='p-4 bg-[#0a0a0a] border-t border-neutral-800/50'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddItem(categoryKey, descInput, valInput);
              setDescInput("");
              setValInput("");
            }}
            className='flex gap-2'>
            <input
              type='text'
              placeholder='Descrição'
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className='flex-1 min-w-0 bg-[#111111] border border-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 placeholder-neutral-600 transition-colors'
            />
            <input
              type='number'
              placeholder='R$ 0,00'
              step='0.01'
              min='0'
              value={valInput}
              onChange={(e) => setValInput(e.target.value)}
              className='w-28 bg-[#111111] border border-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 placeholder-neutral-600 transition-colors'
            />
            <button
              type='submit'
              disabled={!descInput || !valInput}
              className='bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-black p-2.5 rounded-xl transition-colors flex-shrink-0'>
              <Plus className='w-5 h-5' />
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (view === "home") {
    return (
      <div className='min-h-screen bg-black font-sans text-white pb-12'>
        <header className='bg-[#0a0a0a] border-b border-neutral-900 sticky top-0 z-10'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center gap-3 text-xl font-bold text-white'>
              <div className='bg-yellow-500 p-2 rounded-lg flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-black' />
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none mb-1'>
                  Bem-vindo ao
                </span>
                <span className='uppercase tracking-wide leading-none text-base'>
                  Monolito Financias
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
          <div className='mb-8 bg-[#111111] border border-neutral-800/50 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-yellow-500/10 rounded-xl'>
                <DollarSign className='w-6 h-6 text-yellow-500' />
              </div>
              <div>
                <h2 className='text-sm font-bold text-white uppercase tracking-wider'>
                  Renda Base / Salário
                </h2>
                <p className='text-xs text-neutral-500 mt-1'>
                  Valor padrão usado ao iniciar meses novos.
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 w-full sm:w-auto'>
              <span className='text-neutral-500 font-bold text-lg'>R$</span>
              <input
                type='number'
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className='flex-1 sm:w-40 bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-yellow-500/50 transition-colors'
              />
            </div>
          </div>

          <div className='flex flex-col md:flex-row gap-8 items-start'>
            <div className='w-full md:w-80 lg:w-96 flex-shrink-0 md:sticky md:top-24'>
              <div className='bg-[#111111] border border-neutral-800/50 rounded-2xl p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <Calendar className='w-5 h-5 text-yellow-500' />
                  <h2 className='text-xs font-bold text-yellow-500 uppercase tracking-widest'>
                    Novo Período
                  </h2>
                </div>
                <form
                  onSubmit={handleCreateMonth}
                  className='flex flex-col gap-5'>
                  <input
                    type='month'
                    value={monthInputValue}
                    onChange={handleDateChange}
                    className='w-full bg-[#0a0a0a] border border-neutral-800 text-white rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-yellow-500/50 transition-colors [color-scheme:dark] cursor-pointer'
                    required
                  />
                  <button
                    type='submit'
                    className='w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-sm py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/10'>
                    Criar / Abrir
                  </button>
                </form>
              </div>
            </div>

            <div className='flex-1 w-full min-w-0'>
              <h2 className='text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6'>
                Arquivos Salvos
              </h2>
              <div className='space-y-8'>
                {Object.keys(data)
                  .sort((a, b) => b - a)
                  .map((year) => (
                    <div
                      key={year}
                      className='bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-6'>
                      <h3 className='text-xl font-bold text-white mb-6 flex items-center gap-3'>
                        <FolderOpen className='w-6 h-6 text-yellow-500' />
                        {year}
                      </h3>
                      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {Object.keys(data[year]).map((month) => {
                          const mData = data[year][month];
                          const rT = mData.receitas.reduce(
                            (acc, c) => acc + Number(c.value),
                            0,
                          );
                          const fT = mData.fixas.reduce(
                            (acc, c) => acc + Number(c.value),
                            0,
                          );
                          const vT = mData.variaveis.reduce(
                            (acc, c) => acc + Number(c.value),
                            0,
                          );
                          const iT = mData.impostos.reduce(
                            (acc, c) => acc + Number(c.value),
                            0,
                          );
                          const oT = mData.objetivos.reduce(
                            (acc, c) => acc + Number(c.value),
                            0,
                          );
                          const dT = fT + vT + iT + oT;
                          const sM = rT - dT;
                          const max = Math.max(fT, vT, iT, oT, 1);
                          const getH = (v) => (v / max) * 35;
                          const bars = [
                            { id: "f", l: "Fixas", v: fT, x: 6, c: "#ef4444" },
                            {
                              id: "v",
                              l: "Contas",
                              v: vT,
                              x: 29,
                              c: "#f97316",
                            },
                            { id: "i", l: "Imp.", v: iT, x: 52, c: "#8b5cf6" },
                            { id: "o", l: "Obj.", v: oT, x: 75, c: "#3b82f6" },
                          ].map((p) => ({
                            ...p,
                            h: Math.max(getH(p.v), 2),
                            y: 45 - Math.max(getH(p.v), 2),
                          }));

                          return (
                            <div
                              key={month}
                              onClick={() => openMonth(year, month)}
                              className='bg-[#111111] border border-neutral-800 hover:border-yellow-500/50 hover:bg-[#141414] rounded-2xl p-5 cursor-pointer transition-all group flex flex-col gap-4 overflow-hidden'>
                              <div className='flex justify-between items-center min-w-0'>
                                <span className='font-bold text-white text-lg group-hover:text-yellow-500 transition-colors truncate'>
                                  {month}
                                </span>
                                <ArrowRight className='w-5 h-5 text-neutral-600 group-hover:text-yellow-500 transition-colors flex-shrink-0' />
                              </div>
                              <div className='flex items-center gap-3 min-w-0'>
                                <div className='relative w-20 h-14 flex-shrink-0 group/chart bg-neutral-900/50 rounded-lg border border-neutral-800/80 p-2'>
                                  <svg
                                    viewBox='0 0 100 50'
                                    className='w-full h-full overflow-visible'>
                                    <line
                                      x1='2'
                                      y1='45'
                                      x2='98'
                                      y2='45'
                                      stroke='#262626'
                                      strokeWidth='2'
                                    />
                                    {bars.map((p) => (
                                      <g
                                        key={p.id}
                                        className='group/bar cursor-pointer'>
                                        <rect
                                          x={p.x}
                                          y={p.y}
                                          width='14'
                                          height={p.h}
                                          fill={p.c}
                                          rx='3'
                                          className='transition-all duration-200 group-hover/bar:brightness-125'
                                        />
                                        <text
                                          x={p.x + 7}
                                          y={p.y - 6}
                                          textAnchor='middle'
                                          fill={p.c}
                                          fontSize='9'
                                          fontWeight='bold'
                                          className='opacity-0 group-hover/bar:opacity-100 transition-opacity'>
                                          {p.l}
                                        </text>
                                        <title>{`${p.l}: ${formatCurrency(p.v)}`}</title>
                                      </g>
                                    ))}
                                  </svg>
                                </div>
                                <div className='flex flex-col flex-1 gap-1 min-w-0 pr-2 sm:pr-4'>
                                  <div className='flex justify-between items-center text-[10px] sm:text-xs gap-2 min-w-0'>
                                    <TrendingUp className='w-4 h-4 text-emerald-500 flex-shrink-0' />
                                    <span className='text-emerald-500 font-bold whitespace-nowrap'>
                                      {formatCurrency(rT)}
                                    </span>
                                  </div>
                                  <div className='flex justify-between items-center text-[10px] sm:text-xs gap-2 min-w-0'>
                                    <TrendingDown className='w-4 h-4 text-red-500 flex-shrink-0' />
                                    <span className='text-red-500 font-bold whitespace-nowrap'>
                                      {formatCurrency(dT)}
                                    </span>
                                  </div>
                                  <div className='w-full h-px bg-neutral-800/50 my-0.5'></div>
                                  <div className='flex justify-between items-center text-[10px] sm:text-xs gap-2 min-w-0'>
                                    <Wallet
                                      className={`w-4 h-4 flex-shrink-0 ${sM >= 0 ? "text-emerald-500" : "text-red-500"}`}
                                    />
                                    <span
                                      className={`font-bold whitespace-nowrap ${sM >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                      {formatCurrency(sM)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black font-sans text-white pb-12'>
      <header className='bg-[#0a0a0a] border-b border-neutral-900 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4'>
          <button
            onClick={() => setView("home")}
            className='flex items-center gap-2 text-neutral-400 hover:text-yellow-500 transition-colors text-sm font-bold uppercase tracking-widest'>
            <ArrowLeft className='w-5 h-5' />
            Arquivo
          </button>
          <div className='flex items-center gap-3'>
            <span className='uppercase tracking-widest text-neutral-500 text-xs hidden sm:inline-block'>
              Monolito Financias &bull;
            </span>
            <span className='font-bold text-white'>
              {activeMonth} {activeYear}
            </span>
          </div>
        </div>
      </header>
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8'>
        <div className='mb-8'>
          <h2 className='text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2'>
            Visão Geral
          </h2>
          <p className='text-white text-3xl font-bold'>{activeMonth}</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-[#111111] rounded-2xl p-6 border border-neutral-800/50 flex items-center gap-5'>
            <div className='bg-emerald-500/10 p-4 rounded-xl'>
              <TrendingUp className='w-7 h-7 text-emerald-500' />
            </div>
            <div>
              <p className='text-[11px] font-bold text-neutral-500 uppercase tracking-widest'>
                Receitas
              </p>
              <h3 className='text-2xl font-bold text-white'>
                {formatCurrency(totalReceitas)}
              </h3>
            </div>
          </div>
          <div className='bg-[#111111] rounded-2xl p-6 border border-neutral-800/50 flex items-center gap-5'>
            <div className='bg-red-500/10 p-4 rounded-xl'>
              <TrendingDown className='w-7 h-7 text-red-500' />
            </div>
            <div>
              <p className='text-[11px] font-bold text-neutral-500 uppercase tracking-widest'>
                Saídas
              </p>
              <h3 className='text-2xl font-bold text-white'>
                {formatCurrency(totalDespesas)}
              </h3>
            </div>
          </div>
          <div
            className={`rounded-2xl p-6 border flex items-center gap-5 ${saldo >= 0 ? "bg-[#111111] border-emerald-900/30" : "bg-[#111111] border-red-900/30"}`}>
            <div
              className={`p-4 rounded-xl ${saldo >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              <Wallet
                className={`w-7 h-7 ${saldo >= 0 ? "text-emerald-500" : "text-red-500"}`}
              />
            </div>
            <div>
              <p className='text-[11px] font-bold text-neutral-500 uppercase tracking-widest'>
                Saldo
              </p>
              <h3
                className={`text-2xl font-bold ${saldo >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatCurrency(saldo)}
              </h3>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          <CategorySection categoryKey='receitas' />
          <CategorySection categoryKey='fixas' />
          <CategorySection categoryKey='variaveis' />
          <CategorySection categoryKey='impostos' />
          <CategorySection categoryKey='objetivos' />
        </div>
      </main>
    </div>
  );
}
