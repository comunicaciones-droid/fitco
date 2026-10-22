import numpy as np
def coons(f, y0, y1, x0, x1, k=4):
    """Fill f[y0:y1, x0:x1] by bilinearly blended (Coons) interpolation of the surrounding border (avg of k px)."""
    f = f.astype(np.float32) if f.dtype != np.float32 else f
    top = f[max(y0-k,0):y0, x0:x1].mean(0)
    bot = f[y1:y1+k, x0:x1].mean(0)
    left = f[y0:y1, max(x0-k,0):x0].mean(1)
    right = f[y0:y1, x1:x1+k].mean(1)
    h, w = y1-y0, x1-x0
    v = (np.arange(h)+0.5)/h; u = (np.arange(w)+0.5)/w
    V = v[:,None,None]; U = u[None,:,None]
    c00 = f[max(y0-k,0):y0, max(x0-k,0):x0].reshape(-1,3).mean(0)
    c01 = f[max(y0-k,0):y0, x1:x1+k].reshape(-1,3).mean(0)
    c10 = f[y1:y1+k, max(x0-k,0):x0].reshape(-1,3).mean(0)
    c11 = f[y1:y1+k, x1:x1+k].reshape(-1,3).mean(0)
    L = (1-V)*top[None] + V*bot[None] + (1-U)*left[:,None] + U*right[:,None]
    B = (1-U)*(1-V)*c00 + U*(1-V)*c01 + (1-U)*V*c10 + U*V*c11
    return L - B
