import React from "react";
import { NewCrowdfund } from "../../components/Crowdfund/NewCrowdfund";
import { CrowdfundList } from "./CrowdfundList";
import {
  HomePageContainer,
  HomepageDescription,
  HomepageTitle,
} from "./Home-styles";

export const Home = () => {
  return (
    <>
      <HomePageContainer>
        <HomepageTitle>Qortal Crowdfunding</HomepageTitle>
        <HomepageDescription>
          Qortal Crowdfunding is a decentralized crowdfunding platform built on
          the Qortal blockchain. It allows users to create and contribute to
          crowdfunding campaigns that are stored on the blockchain.
        </HomepageDescription>
        <NewCrowdfund />
      </HomePageContainer>
      <CrowdfundList />
    </>
  );
};
