// Keeps the VideosdkRPK native module that @videosdk.live/expo-ios-screen-share adds out of the
// app build. React Native SDK 2.0.0 opens the broadcast picker itself, and the module no
// longer compiles against Expo 57's prebuilt React core. The broadcast extension stays.
const { withXcodeProject } = require("expo/config-plugins");

const RPK_FILES = ["VideosdkRPK.swift", "VideosdkRPK.m"];

module.exports = function withoutVideosdkRPK(config) {
  return withXcodeProject(config, (projectConfig) => {
    const project = projectConfig.modResults;
    const buildFiles = project.pbxBuildFileSection();
    const removed = new Set();
    for (const [key, buildFile] of Object.entries(buildFiles)) {
      if (key.endsWith("_comment")) continue;
      if (RPK_FILES.includes(buildFile.fileRef_comment)) {
        delete buildFiles[key];
        delete buildFiles[`${key}_comment`];
        removed.add(key);
      }
    }
    const sourcesPhases = project.hash.project.objects.PBXSourcesBuildPhase;
    for (const [key, phase] of Object.entries(sourcesPhases)) {
      if (key.endsWith("_comment")) continue;
      phase.files = phase.files.filter((file) => !removed.has(file.value));
    }
    return projectConfig;
  });
};
