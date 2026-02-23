"use client";

import { useState, useRef, memo, useCallback, useMemo, lazy, Suspense, useEffect } from "react";

const TitleBar = memo(({ title }: { title: string }) => {
  return (
    <div className="titlebar">
      <span>{title}</span>
    </div>
  );
});

const TitleBarWithButtons = memo(({ title, onClose }: { title: string; onClose?: () => void }) => {
  return (
    <div className="titlebar">
      <span>{title}</span>
      <div className="titlebar-buttons">
        <div
          className="titlebar-btn"
          role="button"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && onClose) {
              event.preventDefault();
              onClose();
            }
          }}
        >
          ×
        </div>
      </div>
    </div>
  );
});


export default function Home() {
  const [twitter, setTwitter] = useState("");
  const [wallet, setWallet] = useState("");
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [checkerWallet, setCheckerWallet] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [showCheckerModal, setShowCheckerModal] = useState(false);
  const [checkerError, setCheckerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const checkerInputRef = useRef<HTMLInputElement>(null);

  const blurActiveElement = useCallback(() => {
    if (typeof document !== "undefined") {
      const active = document.activeElement as HTMLElement | null;
      active?.blur();
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!twitter && !wallet) {
      setError("please enter your twitter handle and wallet address");
      return;
    }

    if (!twitter) {
      setError("please enter your twitter handle");
      return;
    }

    if (!wallet) {
      setError("please enter your wallet address");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twitter: twitter.trim(),
          wallet: wallet.trim(),
          code: code.trim() || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Submission successful:', data);
        blurActiveElement();
        setShowModal(true);
        setCheckerError("");
      } else {
        setError(data.error || 'submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError('network error - please try again');
    } finally {
      setIsSubmitting(false);
    }
  }, [twitter, wallet, code, blurActiveElement]);

  const handleCheckWhitelist = useCallback(async () => {
    if (!checkerWallet) {
      setCheckResult({ found: false, error: "please enter wallet address" });
      return;
    }
    setIsChecking(true);

    try {
      const response = await fetch('/api/check-whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: checkerWallet.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.found) {
          setCheckResult(data);
          blurActiveElement();
          setShowCheckerModal(true);
          setCheckerError("");
        } else {
          setCheckResult(null);
          setShowCheckerModal(false);
          setCheckerError(data.message || 'not found on whitelist');
        }
      } else {
        setCheckResult(null);
        setShowCheckerModal(false);
        setCheckerError(data.error || 'check failed');
      }
    } catch (error) {
      console.error('Check error:', error);
      setCheckResult({ found: false, error: 'network error - please try again' });
    } finally {
      setIsChecking(false);
    }
  }, [checkerWallet]);

  // Optimized input handlers
  const handleTwitterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTwitter(e.target.value);
  }, []);

  const handleWalletChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWallet(e.target.value);
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  }, []);

  const handleCheckerWalletChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckerWallet(e.target.value);
  }, []);

  // Memoized modal close handlers
  const handleCloseModal = useCallback(() => {
    blurActiveElement();
    setShowModal(false);
    setTwitter("");
    setWallet("");
    setCode("");
  }, [blurActiveElement]);

  const handleCloseCheckerModal = useCallback(() => {
    blurActiveElement();
    setShowCheckerModal(false);
    setCheckResult(null);
    setCheckerWallet("");
  }, [blurActiveElement]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowLinkModal(true);
  }, []);

  const handleCloseLinkModal = useCallback(() => {
    setShowLinkModal(false);
  }, []);

  useEffect(() => {
    const anyModalOpen = showModal || showCheckerModal || showLinkModal;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        if (showModal) {
          handleCloseModal();
        } else if (showCheckerModal) {
          handleCloseCheckerModal();
        } else if (showLinkModal) {
          handleCloseLinkModal();
        }
      }
    };

    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [showModal, showCheckerModal, showLinkModal, handleCloseModal, handleCloseCheckerModal, handleCloseLinkModal]);

  useEffect(() => {
    if (!showCheckerModal) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        handleCloseCheckerModal();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCheckerModal, handleCloseCheckerModal]);

  useEffect(() => {
    if (!showLinkModal) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        handleCloseLinkModal();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showLinkModal, handleCloseLinkModal]);

  // Memoize modal content to prevent unnecessary re-renders
  const successModalContent = useMemo(() => (
    <div className="text-center">
      <p className="success-title mb-4">
        {code ? "phase 2 submission successful" : "phase 3 submission successful"}
      </p>
      <button 
        className="button mt-4"
        onClick={handleCloseModal}
      >
        close
      </button>
    </div>
  ), [code, handleCloseModal]);

  const checkerModalContent = useMemo(() => (
    <div className="text-center space-y-3">
      <div className="text-center space-y-2 pt-1" style={{ color: "#000000" }}>
        <p className="font-pixel"><strong>username:</strong> {checkResult?.submission?.twitter}</p>
        <p className="font-pixel"><strong>ethereum address:</strong> {checkResult?.submission?.wallet?.slice(0, 6)}...{checkResult?.submission?.wallet?.slice(-4)}</p>
        <p className="font-pixel"><strong>phase 2:</strong> {checkResult?.submission?.phase2 ? 'yes' : 'no'}</p>
        <p className="font-pixel"><strong>phase 3:</strong> {checkResult?.submission?.phase3 ? 'yes' : 'no'}</p>
      </div>
      <button 
        className="button mt-4"
        onClick={handleCloseCheckerModal}
      >
        close
      </button>
    </div>
  ), [checkResult, handleCloseCheckerModal]);

  const linkModalContent = useMemo(() => (
    <div className="text-center space-y-3">
      <p className="font-pixel" style={{ color: "#000000" }}>
        check back soon.&lt;3
      </p>
      <button 
        className="button mt-4"
        onClick={handleCloseLinkModal}
      >
        close
      </button>
    </div>
  ), [handleCloseLinkModal]);

  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[960px] flex flex-col gap-4">

        {/* Top row: Details window (left) + Image window (right) */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* LEFT — Details Window (tall) */}
          <div className="window flex-1 min-w-0 md:max-w-[420px] flex flex-col">
            <TitleBar title="untitled - notepad" />
            <div className="body flex flex-col gap-3 flex-1">

              {/* Combined content area */}
              <div className="inset p-3 flex-1">
                <div className="space-y-2 font-pixel">
                  
                  {/* Header area */}
                  <div className="text-center">
                    <h1
                      className="font-bold tracking-wider main-title font-pixel"
                    >
                      untitled :p (for now)
                    </h1>
                    <p className="subtitle font-pixel">
                      the network is powered by love
                    </p>
                  </div>
                  
                  <div>
                    <p className="section-header mb-0.5 font-pixel">
                      <span
                        className="green-arrow"
                      >
                        &gt;
                      </span> about
                    </p>
                    <p className="about-text font-pixel">
                      sorry no text, waaaah (for now) ur just extremely early!
                    </p>
                  </div>

                  <div className="project-details">
                    <div>
                      <span className="detail-label font-pixel">
                        <span className="green-arrow">&gt;</span> supply:
                      </span>
                      <br />
                      <span className="detail-value font-pixel">
                        tba
                      </span>
                    </div>
                    <div>
                      <span className="detail-label font-pixel">
                        <span className="green-arrow">&gt;</span> wen:
                      </span>
                      <br />
                      <span className="detail-value font-pixel">
                        6/--/26
                      </span>
                    </div>
                    <div>
                      <span className="detail-label font-pixel">
                        <span className="green-arrow">&gt;</span> chain:
                      </span>
                      <br />
                      <span className="detail-value font-pixel">
                        eth
                      </span>
                    </div>
                    <div>
                      <span className="detail-label font-pixel">
                        <span className="green-arrow">&gt;</span> launchpad:
                      </span>
                      <br />
                      <a
                        href="#"
                        onClick={handleLinkClick}
                        className="launchpad-link font-pixel"
                      >
                        scatter.art
                      </a>
                    </div>
                  </div>

                  
                  {/* Mint Phases */}
                  <div>
                    <p className="section-header mb-2">
                      <span
                        className="green-arrow"
                      >
                        &gt;
                      </span> mint phases
                    </p>
                    <div className="space-y-1 phases-container">
                      <div className="flex items-start gap-2 phase-item-container">
                        <span className="phase-bullet">•</span>
                        <div>
                          <span className="phase-name font-pixel">phase 1: treasury</span>
                          <br />
                          <span className="phase-description font-pixel">
                            treasury (250-300 mints)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 phase-item-container">
                        <span className="phase-bullet">•</span>
                        <div>
                          <span className="phase-name font-pixel">phase 2: frens</span>
                          <br />
                          <span className="phase-description font-pixel">
                            friends & contributors
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 phase-item-container">
                        <span className="phase-bullet">•</span>
                        <div>
                          <span className="phase-name font-pixel">phase 3: whitelist</span>
                          <br />
                          <span className="phase-description font-pixel">
                            limited - sign up below!
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 phase-item-container">
                        <span className="phase-bullet">•</span>
                        <div>
                          <span className="phase-name font-pixel">phase 4: public</span>
                          <br />
                          <span className="phase-description font-pixel">
                            open for everyone
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* RIGHT — NFT Image Window */}
          <div className="window video-window min-w-0 flex flex-col">
            <TitleBar title="preview - [untitled.gif]" />
            <div className="body flex-1 flex flex-col">
              <div className="inset flex-1 flex items-center justify-center min-h-[300px] md:min-h-[400px] p-2">
                {/* MP4 video loop - honor original dimensions */}
                <div className="relative w-full h-full bg-[#ff7fdf] flex items-center justify-center overflow-hidden">
                  {/* Video with original dimensions */}
                  <video
                    className="max-w-full max-h-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onMouseEnter={(e) => {
                      const video = e.currentTarget;
                      video.pause();
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget;
                      video.play();
                    }}
                    onEnded={(e) => {
                      const video = e.currentTarget;
                      video.currentTime = 0;
                      video.play();
                    }}
                  >
                    <source src="/video-preview.mp4" type="video/mp4" />
                    {/* Fallback placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[#ff7fdf]">
                      <div className="video-fallback">
                        <div className="text-3xl mb-2">▶</div>
                        <p>video-preview.mp4</p>
                        <p className="text-xs">(loading...)</p>
                      </div>
                    </div>
                  </video>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom — Whitelist Form (left) + Checker (right) */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* LEFT — Whitelist Form Window */}
          <div className="window flex-1 min-w-0">
            <TitleBar title="phase 3 - whitelist form [live]" />
            <div className="body">
              <div className="inset p-4" style={{ minHeight: '400px' }}>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="green-arrow"
                    >
                      &gt;
                    </span>
                    <p className="form-description font-pixel">
                      enter your details below to claim your phase 3 whitelist spot.
                      limited.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <label className="form-label font-pixel">
                        twitter username
                      </label>
                      <input
                        type="text"
                        value={twitter}
                        onChange={handleTwitterChange}
                        placeholder="@"
                        className="input w-full pl-6"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="form-label font-pixel">
                        wallet address
                      </label>
                      <input
                        type="text"
                        value={wallet}
                        onChange={handleWalletChange}
                        placeholder="0x..."
                        className="input w-full pl-6"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <label className="form-label font-pixel">
                          phase 2 code (optional)
                        </label>
                        <input
                          type="text"
                          value={code}
                          onChange={handleCodeChange}
                          placeholder="enter code"
                          className="input w-full pl-6"
                        />
                      </div>
                      <div>
                        <button type="submit" className="button w-full" disabled={isSubmitting}>
                          {isSubmitting ? 'submitting...' : 'submit'}
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="error-text">
                        {error}
                      </div>
                    )}
                  </div>

                </form>
              </div>
            </div>
          </div>

          {/* RIGHT — Whitelist Checker Window */}
          <div className="window flex-1 min-w-0">
            <TitleBar title="whitelist checker" />
            <div className="body">
              <div className="inset p-4" style={{ minHeight: '250px' }}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="green-arrow"
                    >
                      &gt;
                    </span>
                    <p className="form-description font-pixel">
                      check if you're on the whitelist.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <label className="form-label font-pixel">
                        wallet address
                      </label>
                      <input
                        ref={checkerInputRef}
                        type="text"
                        value={checkerWallet}
                        onChange={handleCheckerWalletChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCheckWhitelist();
                          }
                        }}
                        className="input w-full"
                        placeholder="0x..."
                      />
                    </div>
                  </div>

                  <div>
                    <button 
                      type="button" 
                      className="button w-full"
                      onClick={handleCheckWhitelist}
                      disabled={isChecking}
                    >
                      {isChecking ? 'subbmitting...' : 'submit'}
                    </button>
                    
                    {checkerError && (
                      <div className="error-text mt-2">
                        {checkerError}
                      </div>
                    )}
                  </div>

                                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Window */}
        <div className="window">
          <div className="body py-2">
            <div className="footer">
              <a
                href="#"
                onClick={handleLinkClick}
                className="hover:underline font-pixel"
                style={{ color: "#000000" }}
              >
                twitter
              </a>
              <span>|</span>
              <a
                href="#"
                onClick={handleLinkClick}
                className="hover:underline font-pixel"
                style={{ color: "#000000" }}
              >
                discord
              </a>
              <span>|</span>
              <a
                href="#"
                onClick={handleLinkClick}
                className="hover:underline font-pixel"
                style={{ color: "#000000" }}
              >
                telegram
              </a>
              <span>|</span>
              <a
                href="#"
                onClick={handleLinkClick}
                className="hover:underline font-pixel"
                style={{ color: "#000000" }}
              >
                scatter.art
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="window"
            style={{ minWidth: '300px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <TitleBarWithButtons
              title={code ? "phase 2 - whitelist form [live]" : "phase 3 - whitelist form [live]"}
              onClose={handleCloseModal}
            />
            <div className="body p-4">
              {successModalContent}
            </div>
          </div>
        </div>
      )}

      {/* Whitelist Checker Modal */}
      {showCheckerModal && (
        <div className="modal-overlay" onClick={handleCloseCheckerModal}>
          <div
            className="window"
            style={{ minWidth: '350px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <TitleBarWithButtons title="whitelist checker" onClose={handleCloseCheckerModal} />
            <div className="body p-4">
              {checkerModalContent}
            </div>
          </div>
        </div>
      )}

      {/* Link Popup Modal */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={handleCloseLinkModal}>
          <div
            className="window"
            style={{ minWidth: '300px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <TitleBarWithButtons title="something happened.." onClose={handleCloseLinkModal} />
            <div className="body p-4">
              {linkModalContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
