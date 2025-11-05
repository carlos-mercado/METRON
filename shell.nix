  { pkgs ? import <nixpkgs> {} }:

  pkgs.mkShell {
    buildInputs = with pkgs; [
      nodejs_20
    ];

    shellHook = ''
      export PATH=$(pwd)/node_modules/.bin:$PATH
    '';
  }
