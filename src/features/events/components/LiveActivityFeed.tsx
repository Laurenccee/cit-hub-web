'use client';

import { useEffect, useState } from 'react';

interface ScanRow {
    key: string;
    cardId: string;
    name: string;
    elapsed: number;
}

const scanPool = [
    { cardId: 'CIT-2023-8812', name: 'Marc V. (CCS)' },
    { cardId: 'CIT-2022-0419', name: 'Clarisse D. (COE)' },
    { cardId: 'CIT-2024-1103', name: 'Jessa R. (CIT)' },
    { cardId: 'CIT-2021-7756', name: 'Paolo S. (CCS)' },
    { cardId: 'CIT-2023-5521', name: 'Aerol T. (COE)' },
];

function formatAgo(elapsed: number) {
    if (elapsed < 60) return `${elapsed}s ago`;
    return `${Math.floor(elapsed / 60)}m ago`;
}

export function LiveActivityFeed({ onScan }: { onScan?: () => void }) {
    const [rows, setRows] = useState<ScanRow[]>([
        { key: 'row-0', ...scanPool[0], elapsed: 12 },
        { key: 'row-1', ...scanPool[1], elapsed: 45 },
    ]);
    const [poolIndex, setPoolIndex] = useState(2);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setRows((current) =>
                current.map((row) => ({ ...row, elapsed: row.elapsed + 1 })),
            );
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            const next = scanPool[poolIndex % scanPool.length];
            setRows((current) =>
                [
                    {
                        key: `row-${Date.now()}`,
                        ...next,
                        elapsed: 3,
                    },
                    ...current,
                ].slice(0, 3),
            );
            setPoolIndex((index) => index + 1);
            onScan?.();
        }, 18000);
        return () => window.clearInterval(timer);
    }, [poolIndex, onScan]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Recent live activity
                </p>
                <p className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    Auto-syncing • Gate A
                </p>
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
                {rows.map((row) => (
                    <li
                        key={row.key}
                        className="flex items-center gap-2 rounded-md border border-slate-100 bg-white px-2.5 py-1.5"
                    >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                        <span className="truncate text-[11px] font-bold text-slate-800">
                            {row.cardId}
                        </span>
                        <span className="truncate text-[11px] text-slate-400">
                            {row.name}
                        </span>
                        <span className="ml-auto shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            In • {formatAgo(row.elapsed)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
