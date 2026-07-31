import type {
  ChangeOutputsDto,
  ChangeSetPointsDto,
  ChangeSetupDto,
  ControlLoopDto,
  PicoUnit,
  UpdatePicoUnitDto,
} from '~api/generated';

export type PicoUnitCtx = {
  pico?: PicoUnit;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
  pollPico: {
    mutate: (params: { picoUnitId: number }) => void;
    mutateAsync: (params: { picoUnitId: number }) => Promise<PicoUnit>;
    isLoading: boolean;
  };
  updatePico: {
    mutate: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) => Promise<any>;
    isLoading: boolean;
  };
  deletePico: {
    mutate: (id: number) => void;
    mutateAsync: (id: number) => Promise<any>;
    isLoading: boolean;
  };
  toggleControlLoop?: {
    mutate: (vars: { picoUnitId: number; body: ControlLoopDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ControlLoopDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeTargets?: {
    mutate: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeOutputs?: {
    mutate: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeSetup?: {
    mutate: (vars: { picoUnitId: number; body: ChangeSetupDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeSetupDto }) => Promise<any>;
    isLoading: boolean;
  };
};
