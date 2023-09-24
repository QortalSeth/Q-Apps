import { useEffect, useCallback, useState } from "react";

export const useFetchCrowdfundStatus = (
  crowdfundData: any,
  atAddress: string
) => {
  const [ATDeployed, setATDeployed] = useState<boolean>(false);
  const [ATCompleted, setATCompleted] = useState<boolean>(false);
  const [ATLoadingStatus, setATLoadingStatus] = useState<string>(
    "Verifying Deployment Status..."
  );
  const [ATStatus, setATStatus] = useState<string>("");
  const [ATAmount, setATAmount] = useState<number | null>(null);

  // First check if the crowdfund has been deployed.
  // If it has, check if the AT is still active by making an API request with transaction/search, type AT and looking for property called "amount". If no response, then AT is still active. If there is a response, it is completed.
  // If it is completed, check if amount value is greater than or equal to the goal value. If it is, then the goal has been achieved. If it isn't, then the goal has not been achieved.

  // Fetch AT Deployment Status using the AT Address
  const fetchQFundDeploymentStatus = useCallback(async () => {
    try {
      if (!atAddress) return;
      const res = await qortalRequest({
        action: "SEARCH_TRANSACTIONS",
        txType: ["DEPLOY_AT"],
        confirmationStatus: "CONFIRMED",
        address: atAddress,
        limit: 1,
        reverse: true,
      });
      if (res?.length > 0) {
        // Check if AT is sleeping and isn't finished yet
        const url = `/at/${atAddress}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200) {
          const responseDataSearch = await response.json();
          if (
            responseDataSearch?.sleepUntilHeight &&
            !responseDataSearch?.isFinished
          ) {
            setATDeployed(true);
            setATLoadingStatus("Verifying Q-Fund Completion Status...");
            return res;
          } else {
            setATStatus("Q-Fund Being Deployed");
            setATDeployed(false);
            return [];
          }
        } else {
          setATStatus("Q-Fund Being Deployed");
          setATDeployed(false);
          return [];
        }
      } else {
        setATStatus("Q-Fund Being Deployed");
        setATDeployed(false);
        return [];
      }
    } catch (error) {
      console.error(error);
      setATLoadingStatus("Error when fetching Q-Fund Deployment Status");
    }
  }, [atAddress]);

  // useEffect that checks whether a Q-Fund is currently in deployment or not. If it is, we prevent the user from donating to the Q-Fund. We do polling every 30 seconds.
  useEffect(() => {
    if (atAddress) {
      let intervalId: number | undefined;
      const checkDeploymentStatus = async () => {
        const checkStatus = async () => {
          const ATFound = await fetchQFundDeploymentStatus();
          if (ATFound?.length > 0) {
            clearInterval(intervalId); // Stop the polling if AT becomes available
          } else {
            setATDeployed(false);
            setATLoadingStatus("");
          }
        };
        checkStatus();
        intervalId = setInterval(checkStatus, 30000);
        // Clear the interval when the component unmounts
        return () => {
          if (intervalId) clearInterval(intervalId);
        };
      };
      checkDeploymentStatus();
    }
  }, [atAddress, fetchQFundDeploymentStatus]);

  // See if AT is completed
  const fetchQFundCompletionStatus = useCallback(async () => {
    try {
      if (!atAddress) return;
      const res = await qortalRequest({
        action: "SEARCH_TRANSACTIONS",
        txType: ["AT"],
        confirmationStatus: "CONFIRMED",
        address: atAddress,
        limit: 1,
        reverse: true,
      });
      if (res?.length > 0) {
        setATCompleted(true);
        setATLoadingStatus("");
        setATAmount(res[0]?.amount);
        // Check if AT is achieved or not achieved
        if (res[0]?.amount >= crowdfundData?.deployedAT?.goalValue) {
          setATStatus("Q-Fund Goal Achieved");
        } else {
          setATStatus("Q-Fund Goal Not Achieved");
        }
      } else {
        setATCompleted(false);
        setATLoadingStatus("");
        setATStatus("Q-Fund In Progress");
      }
    } catch (error) {
      console.error(error);
      setATLoadingStatus("Error when fetching Q-Fund Completion Status");
    }
  }, [atAddress]);

  // useEffect that check if AT is completed or not. If it is completed, we then check if it is achieved or not achieved based on the amount value.
  useEffect(() => {
    if (ATDeployed && atAddress) {
      const checkCompletionStatus = async () => {
        await fetchQFundCompletionStatus();
      };
      checkCompletionStatus();
    }
  }, [ATDeployed, atAddress, fetchQFundCompletionStatus]);

  console.log({ ATDeployed, ATCompleted, ATLoadingStatus, ATStatus, ATAmount });

  return {
    ATDeployed,
    ATCompleted,
    ATLoadingStatus,
    ATStatus,
    ATAmount,
  };
};
