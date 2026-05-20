import { resolveApprovalOverGateway } from "nova-ai/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "nova-ai/plugin-sdk/approval-runtime";
import type { Nova AIConfig } from "nova-ai/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "nova-ai/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: Nova AIConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
