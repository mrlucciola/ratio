use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("PublicKeyMismatch")]
    PublicKeyMismatch,
    #[msg("Account does not have correct owner")]
    IncorrectOwner,
    // #[msg("Derived key invalid")]
    // DerivedKeyInvalid,
    #[msg("UninitializedAccount")]
    UninitializedAccount,
    #[msg("The derived interaction signer does not match that which was given.")]
    InvalidInteractionSigner,
}
