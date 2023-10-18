const useTestIdentifiers = false;

export const CROWDFUND_BASE = useTestIdentifiers
  ? "MYTEST_crowdfund_"
  : "q-fund_crowdfund_";

export const ATTACHMENT_BASE = useTestIdentifiers
  ? "attachments_MYTEST_"
  : "attachments_q-fund_";

export const COMMENT_BASE = useTestIdentifiers
  ? "qcomment_v1_MYTEST_"
  : "qcomment_v1_q-fund_";

export const UPDATE_BASE = useTestIdentifiers
  ? "MYTEST_update_crowdfund_"
  : "q-fund_update_crowdfund_";

export const REVIEW_BASE = useTestIdentifiers ? "q-fund-testrw" : "q-fund-rw";

// export const CROWDFUND_BASE = 'MYTEST_crowdfund_'

// export const ATTACHMENT_BASE = 'attachments_MYTEST_'

// export const COMMENT_BASE = 'qcomment_v1_MYTEST_'

// export const UPDATE_BASE = 'MYTEST_update_crowdfund_'

// export const REVIEW_BASE = "q-fund-testrw"
