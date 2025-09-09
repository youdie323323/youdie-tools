"use client";

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { useState, ReactNode } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import MathematicaLicenseCrackerPage1English from "./tools/pages/english/mathematica-license-cracker-page-1.mdx";

import { generateRandomString, MACHINE_NUMBER, encrypt, CRC_POLYNOMIAL_1, encodeNumberToCRC, CRC_POLYNOMIAL_2, generatePassword, INITIAL_CRC, validateFormat } from "./tools/MathematicaLicenseCracker";

const enum Language {
    ENGLISH,
    JAPANESE,
}

const enum LanguagePackIdentifiers {
    TOOL_MATHEMATICA_LICENSE_CRACKER_NAME,
    TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION,
}

type LanguagePack = {
    [key in LanguagePackIdentifiers]: string;
};

const LANGUAGE_PACK_ENGLISH: LanguagePack = {
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_NAME]: "Mathematica License Cracker",
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION]: "This tool cracks mathematica license",
};

const LANGUAGE_PACK_JAPANESE: LanguagePack = {
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_NAME]: "Mathematica ライセンスクラッカー",
    [LanguagePackIdentifiers.TOOL_MATHEMATICA_LICENSE_CRACKER_DESCRIPTION]: "このツールはMathematicaのライセンスを割ります",
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

const MathematicaLicenseCrackerPage2English = () => {
    const [expirationDate, setExpirationDate] = useState(new Date());

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <p className="text-4xl" style={{ fontVariant: "small-caps" }}>Cracker</p>

            <div className="flex flex-col items-start">
                <label htmlFor="machine-id-input">Machine Id</label>
                <input
                    type="text"
                    id="machine-id-input"
                    className="form-control string-inputter"
                    placeholder="XXXX-XXXXX-XXXXX"
                />
            </div>

            <br />

            <div className="flex flex-col items-start">
                <label htmlFor="expiration-date-picker">Expiration Date</label>
                <DatePicker
                    className="form-control string-inputter"
                    selected={expirationDate}
                    onChange={(date) => date && setExpirationDate(date)}
                    id="expiration-date-picker"
                />
            </div>

            <br />

            <button
                onClick={() => {
                    const machineIdInput = document.getElementById("machine-id-input") as HTMLInputElement;
                    const activationKeyInput = document.getElementById("activation-key-input") as HTMLInputElement;
                    const passwordInput = document.getElementById("password-input") as HTMLInputElement;

                    const machineId = machineIdInput.value;
                    if (!validateFormat("XXXX-XXXXX-XXXXX", machineId)) { // Validate
                        alert("Machine Id is not valid");

                        return;
                    }

                    const expirationDateFinalized = 1e4 * expirationDate.getFullYear() + 1e2 * (expirationDate.getMonth() + 1) + expirationDate.getDate();

                    const activationKey = generateRandomString("xxxx-xxxx-aaaaaa");

                    const cipherText = `${machineId}@${expirationDateFinalized}$${MACHINE_NUMBER}&${activationKey}`;
                    const cipherCharCodesReversed = [...String(cipherText)].reverse().map((c) => c.charCodeAt(0));

                    let crc = INITIAL_CRC;

                    const encryptedValue1 = encrypt(CRC_POLYNOMIAL_1, crc, cipherCharCodesReversed);
                    const finalizedEncryptedValue1 = (encryptedValue1 + 0x72FA) % 65536;

                    crc = encodeNumberToCRC(CRC_POLYNOMIAL_2, finalizedEncryptedValue1);

                    const encryptedValue2 = encrypt(CRC_POLYNOMIAL_2, crc, cipherCharCodesReversed);

                    activationKeyInput.value = activationKey;
                    passwordInput.value = `${generatePassword(finalizedEncryptedValue1, encryptedValue2)}::${MACHINE_NUMBER}:${expirationDateFinalized}`;
                }}
                className={`general-purpose-input`}
            >
                Crack License
            </button>

            <br />

            <p className="text-4xl" style={{ fontVariant: "small-caps" }}>Cracked</p>

            <div className="flex flex-col items-start">
                <label htmlFor="activation-key-input">Activation Key</label>
                <input
                    type="text"
                    id="activation-key-input"
                    className="form-control string-inputter"
                    placeholder="XXXX-XXXX-XXXXXX"
                    readOnly={true}
                />
            </div>

            <br />

            <div className="flex flex-col items-start">
                <label htmlFor="password-input">Password</label>
                <input
                    type="text"
                    id="password-input"
                    className="form-control string-inputter"
                    readOnly={true}
                />
            </div>
        </div>
    );
};

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

    const closeToolWindow = () => setOpenedTools(null);

    const [descriptionOpenedTools, setDescriptionOpenedTools] = useState<Record<string, boolean>>({});

    const toggleToolDescriptionOpened = (id: string) => {
        setDescriptionOpenedTools(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col gap-4 w-full max-w-lg px-4">
                    {TOOLS.map(tool => (
                        <div key={tool.id} className="w-full">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <motion.div
                                    animate={{ rotate: descriptionOpenedTools[tool.id] ? 90 : 0 }}
                                    transition={TOOL_DESCRIPTION_TRANSITION}
                                    onClick={() => toggleToolDescriptionOpened(tool.id)}
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
                        <p>Found a bug? Please <a href="https://github.com/youdie323323/youdie-tools/issues" className="underline hover:text-gray-300">report it on GitHub</a>.</p>
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