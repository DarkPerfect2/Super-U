import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { getCollections } from "../db";
import { JWT_SECRET, REFRESH_TOKEN_EXPIRY } from "../config";

export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
  jti: string;
  familyId: string;
}

function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export async function issueInitialRefreshToken(userId: string): Promise<{ token: string; familyId: string; jti: string }>
{
  const jti = nanoid();
  const familyId = jti;
  const token = signRefreshToken({ userId, type: "refresh", jti, familyId });

  const decoded: any = jwt.decode(token);
  const exp = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : undefined;

  const { refreshTokens } = await getCollections();
  await refreshTokens.insertOne({
    jti,
    familyId,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: exp,
    revokedAt: null,
  });

  return { token, familyId, jti };
}

export async function rotateRefreshToken(oldToken: string): Promise<{ newToken: string; userId: string }>
{
  const decoded = jwt.verify(oldToken, JWT_SECRET) as RefreshTokenPayload & { exp?: number };
  if (decoded.type !== "refresh") {
    throw Object.assign(new Error("Invalid token type"), { status: 401 });
  }

  const { refreshTokens } = await getCollections();

  const record = await refreshTokens.findOne({ jti: decoded.jti });

  if (!record || record.revokedAt) {
    await refreshTokens.updateMany({ familyId: decoded.familyId }, { $set: { revokedAt: new Date().toISOString() } });
    const err: any = new Error("Refresh token reuse detected");
    err.status = 401;
    throw err;
  }

  await refreshTokens.updateOne({ jti: decoded.jti }, { $set: { revokedAt: new Date().toISOString() } });

  const newJti = nanoid();
  const newToken = signRefreshToken({ userId: decoded.userId, type: "refresh", jti: newJti, familyId: decoded.familyId });
  const newDecoded: any = jwt.decode(newToken);
  const exp = newDecoded?.exp ? new Date(newDecoded.exp * 1000).toISOString() : undefined;

  await refreshTokens.insertOne({
    jti: newJti,
    familyId: decoded.familyId,
    userId: decoded.userId,
    createdAt: new Date().toISOString(),
    expiresAt: exp,
    revokedAt: null,
  });

  return { newToken, userId: decoded.userId };
}

export async function revokeFamily(familyId: string): Promise<void> {
  const { refreshTokens } = await getCollections();
  await refreshTokens.updateMany({ familyId }, { $set: { revokedAt: new Date().toISOString() } });
}
