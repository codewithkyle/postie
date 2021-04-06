export type Request = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Prompt = "confirm" | "input" | null;

export type PostieSettings = {
    request: Request;
    data: DOMStringMap;
    endpoint: string;
    prompt: Prompt;
    promptLabel: string | null;
    promptValue: string | null;
    success: string | null;
    error: string | null;
    preventDisable: boolean;
    once: boolean;
};
