# Community Network

The community network should be profile-first. Models improve later from profiles and probe sessions; the first useful contribution is a well-described robot.

## Contribution Bundle

A contribution bundle should contain:

- robot profile JSON
- one or more probe sessions
- photos or build instructions, if the user chooses to include them
- generated or hand-written programs
- evaluation notes
- license metadata

Recommended structure:

```text
bundle/
  profile.json
  probes/
    session-1.json
    session-2.json
  programs/
    arduino-basex/
    ev3dev-python/
  media/
  manifest.json
```

## Trust Model

- Profiles and programs are untrusted until reviewed.
- Shared code should be treated as source, not executed automatically.
- Probe sessions should be safe to ingest as data, but media may contain private information.
- Use content hashes for files referenced by manifests.

## Licensing

Default recommendation:

- profiles and probe metadata: `CC-BY-4.0`
- generated code and templates: repo license, currently `MIT`
- photos/build instructions: user-selected license

Agents should not assign public licenses to user media without explicit approval.

## Matching Flow

When the app or server sees an unknown robot:

1. Run safe probes.
2. Extract features.
3. Compare to local profile signatures.
4. Return top candidates and confidence.
5. Ask for a user label if confidence is low.
6. Offer to export a contribution bundle.

## Future Registry

Possible registry fields:

- profile id
- title
- family
- supported kits
- required parts
- port map
- probe signature hash
- program targets
- model compatibility
- contributor and license

