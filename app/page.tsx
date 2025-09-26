"use client";

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { useState, ReactNode } from "react";
import Modal from "react-modal";

import MathematicaLicenseCrackerPage1English from "./tools/MathematicaLicenseCrackerPage1English.mdx";
import MathematicaLicenseCrackerPage2English from "./tools/MathematicaLicenseCrackerPage2English";

import TermiusProPlusPlanCrackerPage1English from "./tools/TermiusProPlusPlanCrackerPage1English.mdx";

const enum Language {
    ENGLISH,
    JAPANESE,
}

const enum LanguagePackIdentifiers {
    TOOL_MATHEMATICA_LICENSE_CRACKER_NAME,
    TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION,

    TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_NAME,
    TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_DESCRIPTION,
}

type LanguagePack = {
    [key in LanguagePackIdentifiers]: string;
};

const LANGUAGE_PACK_ENGLISH: LanguagePack = {
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_NAME]: "Mathematica License Cracker",
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION]: "This tool cracks Mathematica license",

    [LanguagePackIdentifiers.TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_NAME]: "Termius Pro Plus Plan Cracker",
    [LanguagePackIdentifiers.TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_DESCRIPTION]: "This tool cracks Termius pro+ plan",
};

const LANGUAGE_PACK_JAPANESE: LanguagePack = {
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_NAME]: "Mathematica ライセンスクラッカー",
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION]: "このツールを使うことにより、Mathematicaのライセンスを割ることができます",

    [LanguagePackIdentifiers.TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_NAME]: "Termius Pro+プラン クラッカー",
    [LanguagePackIdentifiers.TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_DESCRIPTION]: "このツールを使うことにより、Termiusのプロ以上のプランを無料で取得することができます",
};

function languageToLanguagePack(language: Language): LanguagePack {
    switch (language) {
        case Language.ENGLISH: return LANGUAGE_PACK_ENGLISH;
        case Language.JAPANESE: return LANGUAGE_PACK_JAPANESE;
    }
}

function text(pack: LanguagePack, packIdentifier: LanguagePackIdentifiers): string {
    return pack[packIdentifier];
}

type Tool = {
    id: string;
    name: LanguagePackIdentifiers;
    description: LanguagePackIdentifiers;
    pages: Array<(pack: LanguagePack) => ReactNode>;
};

const TOOLS: Array<Tool> = [
    {
        id: "mathematica-license-cracker",
        name: LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_NAME,
        description: LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION,
        pages: [
            // TODO: support japanese
            (pack) => <MathematicaLicenseCrackerPage1English />,
            (pack) => <MathematicaLicenseCrackerPage2English />,
        ],
    },
    {
        id: "termius-pro-plus-plan-cracker",
        name: LanguagePackIdentifiers.TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_NAME,
        description: LanguagePackIdentifiers.TOOL_TERMIUS_PRO_PLUS_PLAN_CRACKER_DESCRIPTION,
        pages: [
            // TODO: support japanese
            (pack) => <TermiusProPlusPlanCrackerPage1English />,
        ],
    },
];

const TOOL_DESCRIPTION_TRANSITION: Transition<any> = {
    duration: 0.5,
    ease: [0.19, 1, 0.22, 1] // OutExpo cubic-bezier
};

Modal.setAppElement("body");

export default function Root() {
    const [language, setLanguage] = useState<Language>(Language.ENGLISH);

    const languagePack = languageToLanguagePack(language);

    const [openedTool, setOpenedTools] = useState<Tool | null>(null);
    const [toolWindowPageNumber, setToolWindowPageNumber] = useState<number>(1);

    const closeToolWindow = () => {
        setOpenedTools(null);

        // If a user moves to page 2 or beyond in the previous tool, opening a new tool that has only one page will cause an index error
        setToolWindowPageNumber(1);
    };

    const [descriptionOpenedTools, setDescriptionOpenedTools] = useState<Record<string, boolean>>({});

    const toggleToolDescriptionOpen = (id: string) => {
        setDescriptionOpenedTools(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col gap-4 w-full max-w-lg px-4">
                    <p className="text-4xl" style={{ fontVariant: "small-caps" }}>Tools</p>

                    {TOOLS.map(tool => (
                        <div key={tool.id} className="w-full">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <motion.div
                                    animate={{ rotate: descriptionOpenedTools[tool.id] ? 90 : 0 }}
                                    transition={TOOL_DESCRIPTION_TRANSITION}
                                    onClick={() => toggleToolDescriptionOpen(tool.id)}
                                >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </motion.div>
                                <button
                                    onClick={() => setOpenedTools(tool)}
                                    className="general-purpose-input"
                                    id={tool.id}
                                >
                                    {text(languagePack, tool.name)}
                                </button>
                            </div>
                            <AnimatePresence>
                                {descriptionOpenedTools[tool.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={TOOL_DESCRIPTION_TRANSITION}
                                        className="overflow-hidden pl-7"
                                    >
                                        <p className="py-2 text-gray-600">
                                            {text(languagePack, tool.description)}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setLanguage(Language.ENGLISH)}
                            className={`general-purpose-input ${language === Language.ENGLISH ? "general-purpose-input-selected" : ""}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage(Language.JAPANESE)}
                            className={`general-purpose-input ${language === Language.JAPANESE ? "general-purpose-input-selected" : ""}`}
                        >
                            日本語
                        </button>
                    </div>

                    <div className="text-sm text-gray-400 text-center">
                        <p>© 2025 Koki Sato. All rights reserved.</p>
                        <p>Found a bug? Please <a href="https://github.com/youdie323323/youdie-tools/issues" className="underline hover:text-gray-300">issue it on GitHub</a>.</p>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={openedTool !== null}
                onRequestClose={closeToolWindow}
                closeTimeoutMS={100}
                style={{
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    },
                    content: {
                        top: "50%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        marginRight: "-50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "#000000",
                        fontSize: "1.4em",
                        width: "1512px",
                        height: "1008px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                {openedTool && (
                    <div
                        style={{
                            position: "absolute",
                            top: "12px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            textAlign: "center",
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                        }}
                    >
                        {text(languagePack, openedTool.name)}
                    </div>
                )}

                <div className="flex gap-4">
                    {openedTool?.pages.map((page, i) => {
                        const pageNumber = i + 1;

                        return (
                            <button
                                key={pageNumber}
                                onClick={() => setToolWindowPageNumber(pageNumber)}
                                className={`general-purpose-input ${toolWindowPageNumber === pageNumber ? "general-purpose-input-selected" : ""}`}
                            >
                                Page {pageNumber}
                            </button>
                        );
                    })}
                </div>

                <div className="w-full h-px bg-white my-2"></div>

                <button
                    onClick={closeToolWindow}
                    style={{
                        position: "absolute",
                        right: "20px",
                        top: "20px",
                    }}
                >
                    <i className="fa-solid fa-xmark fa-lg" />
                </button>

                {/* Scrollable div */}
                <div id="tool-modal-container" className="flex-1 overflow-y-auto">
                    {openedTool?.pages[toolWindowPageNumber - 1](languagePack)}
                </div>
            </Modal>
        </>
    );
}