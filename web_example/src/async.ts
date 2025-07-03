export interface AsyncInit {
    init: () => Promise<void>;
    destroy: () => Promise<void>;
}