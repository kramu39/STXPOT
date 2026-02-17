;; stx-lucky-pot contract
;; Designed for maximum STX transfer activity on Challenge #3 final day

(define-constant owner tx-sender)

;; Public function to add STX to the pot
(define-public (add-to-pot (amount uint))
  (begin
    (asserts! (> amount u0) (err u1)) ;; Error u1: amount must be greater than 0
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender))) ;; Transfer STX to contract
    (ok true)
  )
)

;; Public function for owner to withdraw the entire pot
(define-public (withdraw-pot)
  (begin
    (asserts! (is-eq tx-sender owner) (err u2)) ;; Error u2: only owner can withdraw
    (let ((pot-balance (stx-get-balance (as-contract tx-sender))))
      (try! (as-contract (stx-transfer? pot-balance tx-sender owner))) ;; Transfer pot to owner
      (ok pot-balance)
    )
  )
)

;; Read-only function to get current pot balance
(define-read-only (get-pot-balance)
  (stx-get-balance (as-contract tx-sender))
)