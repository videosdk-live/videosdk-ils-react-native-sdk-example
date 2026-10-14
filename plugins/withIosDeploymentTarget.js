// Raises every iOS target to the app's deployment target. @videosdk.live/expo-ios-screen-share
// pins its broadcast extension to iOS 14.0, which Xcode 26 and later refuse to build.
const { withXcodeProject } = require("expo/config-plugins");

module.exports = function withIosDeploymentTarget(config, { deploymentTarget = "18.0" } = {}) {
  return withXcodeProject(config, (projectConfig) => {
    const buildConfigurations = projectConfig.modResults.pbxXCBuildConfigurationSection();
    for (const buildConfiguration of Object.values(buildConfigurations)) {
      if (buildConfiguration?.buildSettings?.IPHONEOS_DEPLOYMENT_TARGET) {
        buildConfiguration.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
      }
    }
    return projectConfig;
  });
};
